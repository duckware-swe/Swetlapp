package com.amazonaws.lambda.datagather;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;

import com.amazonaws.lambda.datagather.Response;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.gargoylesoftware.htmlunit.BrowserVersion;
import com.gargoylesoftware.htmlunit.WebClient;
import com.gargoylesoftware.htmlunit.html.HtmlPage;

import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.Item;
import com.amazonaws.services.dynamodbv2.document.PutItemOutcome;
import com.amazonaws.services.dynamodbv2.document.Table;

import com.amazonaws.services.s3.*;
import com.amazonaws.services.s3.model.*;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;


public class LambdaFunctionHandler implements RequestHandler<Object, Response> {

  public static String removeTabs(String string) throws Exception{
    if(string.isEmpty())
      throw new Exception("removeTabs: Stringa vuota in input");
    string=string.replaceAll("\n","");
    string=string.replaceAll("\t","");
    while(string.startsWith(" ")){
      string=string.replaceFirst("\\s","");
    }
    while(string.endsWith(" ")){
      string=string.substring(0,string.length()-1);
    }
    return string;
  }

  public static String removeHypen(String string){
    string=string.replaceAll("-"," ");
    return string;
  }

  public Node searchNode(String name, NodeList list) throws Exception{
    for(int i=0; i<list.getLength(); i++){
      if(list.item(i).getNodeName().equals(name))
        return list.item(i);
    }
    throw new Exception("Nodo "+ name + " non trovato");
  }

  @Override
  public Response handleRequest(Object input, Context context){
    context.getLogger().log("Input: " + input);


    String urlbase = "https://www.sorrisi.com/guidatv/canali-tv/";
    List<String> channellist=new ArrayList();

    AmazonS3 s3client = AmazonS3ClientBuilder.standard()
        .withEndpointConfiguration(new AwsClientBuilder.EndpointConfiguration("https://s3.eu-central-1.amazonaws.com", "eu-central-1"))
        .build();
    S3Object channels = s3client.getObject(new GetObjectRequest("duckwareutils", "canaliTV.txt"));
    InputStream contents = channels.getObjectContent();
    BufferedReader br = new BufferedReader(new InputStreamReader(contents));
    try {
      String line;
      while ((line=br.readLine()) != null) {
        channellist.add(line);
      }
      br.close();
    } catch (IOException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
      return new Response(500);
    }

    AmazonDynamoDB client = AmazonDynamoDBClientBuilder.standard()
        .withEndpointConfiguration(new AwsClientBuilder.EndpointConfiguration("https://dynamodb.eu-central-1.amazonaws.com", "eu-central-1"))
        .build();
    DynamoDB dynamoDB = new DynamoDB(client);
    Table table = dynamoDB.getTable("TVChannels");
    WebClient webClient = new WebClient(BrowserVersion.CHROME);
    webClient.getOptions().setJavaScriptEnabled(false);
    for(String item : channellist) {
      List<Map<String,String>> scheduleList=new ArrayList<>();
      context.getLogger().log("Processing... " + item + "\n");
      HtmlPage page = null;
      try {
        page = (HtmlPage) webClient.getPage(urlbase + item + "/");
      } catch (Exception e1) {
        e1.printStackTrace();
        return new Response(500);
      }
      String pageContent = page.asXml();

      String fix= pageContent.replace( pageContent.substring(pageContent.indexOf("<header class=\"gtv-channel-header\""), pageContent.indexOf("<p class=\"gtv-channel-description\">")), " ");
      DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
      DocumentBuilder builder;
      try {
        builder = factory.newDocumentBuilder();
        Document document = builder.parse(new InputSource(new StringReader(fix)));
        NodeList showNodeList = document.getElementsByTagName("article");
        for (int i = 0; i < showNodeList.getLength(); i++) {
          Element showItem = (Element) showNodeList.item(i);
          NodeList showItemChildNodes = showItem.getChildNodes();
          Map<String,String> mappedValues = new HashMap<>();
          Node timeShowNode = null;
          Node nameShowNode = null;
          
          try{
            timeShowNode=searchNode("time", showItemChildNodes);
          }catch(Exception e){
            e.printStackTrace();
          }
                   
          try {
            nameShowNode = searchNode("a", searchNode("h3", searchNode("header", showItemChildNodes).getChildNodes()).getChildNodes());
          }catch(Exception e){
            e.printStackTrace();
          }
          
          String time = timeShowNode.getFirstChild().getNodeValue();
          String show = nameShowNode.getFirstChild().getNodeValue();
          
          mappedValues.put("time",removeTabs(time));
          mappedValues.put("name",removeTabs(show));
          scheduleList.add(mappedValues);
        }
      } catch (Exception e) {
        System.out.println(e.getMessage());
        return new Response(500);
      }
      PutItemOutcome outcome = table.putItem(new Item().withPrimaryKey("channel", removeHypen(item)).withList("schedule", scheduleList));

    }
    webClient.close();
    context.getLogger().log("SONO ARRIVATO ALLA FINE");
    return new Response(200);
  }

}