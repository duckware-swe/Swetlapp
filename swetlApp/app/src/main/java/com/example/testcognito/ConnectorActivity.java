package com.example.testcognito;


import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.Location;
import android.os.Handler;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.support.v7.widget.LinearLayoutManager;
import android.support.v7.widget.RecyclerView;
import android.util.Log;
import android.view.View;
import android.widget.TextView;
import android.widget.Toast;

import com.amazonaws.amplify.generated.graphql.GetUserQuery;
import com.amazonaws.amplify.generated.graphql.UpdateUserMutation;
import com.amazonaws.mobile.client.AWSMobileClient;
import com.amazonaws.mobileconnectors.appsync.fetcher.AppSyncResponseFetchers;
import com.apollographql.apollo.GraphQLCall;
import com.apollographql.apollo.api.Response;
import com.apollographql.apollo.exception.ApolloException;
import com.example.testcognito.Connector;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.tasks.OnSuccessListener;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Nonnull;

import type.UpdateUserInput;
import type.WorkflowInput;

public class ConnectorActivity extends AppCompatActivity {

    private ArrayList<Connector> mConnectors = new ArrayList<>();

    private ArrayList<Connector> mActiveConnectors = new ArrayList<>();

    public static List<String> inputUpdateWf = new ArrayList<>();

    public static Map<Connector,String> inputUpdateWfMap = new HashMap<>();

    private RecyclerView mRecyclerViewAvailable;

    private RecyclerView mRecyclerViewActive;

    private ActiveConnectorRecycleViewAdapter mActiveConnectorAdapter =
            new ActiveConnectorRecycleViewAdapter(mActiveConnectors, this);

    private AvailableConnectorRecycleViewAdapter mAvailableConnectorAdapter =
            new AvailableConnectorRecycleViewAdapter(mConnectors, this);


    private int currentWfPos;

    static final int SETTED_CN_REQUEST = 1;
    Boolean cnSetted=false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        mActiveConnectors.clear();
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_connector);
       // Log.i("ANDREA oncreate", inputUpdateWf.toString());
        //RecyclerView setup - available connectors
        mRecyclerViewAvailable = findViewById(R.id.availableConnectorsRecycle);
        mRecyclerViewAvailable.setLayoutManager(new LinearLayoutManager(getApplicationContext()));
        mRecyclerViewAvailable.setAdapter(mAvailableConnectorAdapter);

        //RecyclerView setup - active connectors
        mRecyclerViewActive = findViewById(R.id.activeConnectorsRecycle);
        mRecyclerViewActive.setLayoutManager(new LinearLayoutManager(getApplicationContext()));
        mRecyclerViewActive.setAdapter(mActiveConnectorAdapter);

        currentWfPos = getIntent().getIntExtra("currentWfpos",0);
        Log.i("Current WF: ", String.valueOf(currentWfPos));



        //mostra i connettori già impostati del workflow
        retrieveUserConnectors();

        //mostra i connettori disponibili
        setConnectors();





    }

    public void setConnectors() {
        // 1. CONNECTOR - Feed RSS
        Connector feedRSS = new Connector.ConnectorBuilder()
                .name("Feed RSS")
                .action("read_feed")
                .addField("URL")
                .imgRes(R.drawable.rss)
                .build();
        mConnectors.add(feedRSS);
        mAvailableConnectorAdapter.notifyItemInserted(mConnectors.indexOf(feedRSS));

        // 2. CONNECTOR - Custom message
        Connector message = new Connector.ConnectorBuilder()
                .name("Message")
                .action("custom_message")
                .addField("Message body")
                .imgRes(R.drawable.love)
                .build();
        mConnectors.add(message);

        // 2. CONNECTOR - Weather information
        Connector meteo= new Connector.ConnectorBuilder()
                .name("Weather")
                .action("weather")
                .addField("longitude")
                .addField("latitude")
                .imgRes(R.drawable.cloudy)
                .build();
        mConnectors.add(meteo);

        Connector twitterRead= new Connector.ConnectorBuilder()
                .name("Read Tweet")
                .action("read_tweet")
                .addField("account name (es. @unipd)")
                .imgRes(R.drawable.tweet)
                .build();
        mConnectors.add(twitterRead);

        Connector twitterWrite= new Connector.ConnectorBuilder()
                .name("Write Tweet")
                .action("write_tweet")
                .addField("Tweet body")
                .imgRes(R.drawable.twitter_write)
                .build();
        mConnectors.add(twitterWrite);

        Connector tvSchedule= new Connector.ConnectorBuilder()
                .name("TV Schedule")
                .action("tv_schedule")
                .addField("TODO")
                .imgRes(R.drawable.televisions)
                .build();
        mConnectors.add(tvSchedule);


        mAvailableConnectorAdapter.notifyItemInserted(mConnectors.indexOf(feedRSS));

        //Set the "SAVE EDITS" button as not visible
        findViewById(R.id.buttonSaveConnectors).setVisibility(View.GONE);
    }

    public void addConnectorToActive(Connector cn) {

        //cn.setPosition(mActiveConnectors.indexOf(cn));
       // Log.i("ANDREA POS",String.valueOf(cn.getPosition()));
        Boolean cnSetted =false;

        Intent intent = new Intent(ConnectorActivity.this, SetConnectorActivity.class);
        intent.putExtra("connector",cn);
        ConnectorActivity.this.startActivityForResult(intent,SETTED_CN_REQUEST);

    }

    //l'effettivo output a video nella recycle lo fa questo metodo
    //bisogna infatti controllare che il connettore non sia vuoto per metterlo nella recview
    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        switch(requestCode) {
            case (SETTED_CN_REQUEST) : {
                if (resultCode == Activity.RESULT_OK) {
                    cnSetted = data.getBooleanExtra("cnSetted",false);
                    Log.i("ANDREA DISPLAY CN",String.valueOf(cnSetted));
                    if(cnSetted) {
                        Connector toShow = (Connector) data.getSerializableExtra("cn");
                        mActiveConnectors.add(toShow);
                        mActiveConnectorAdapter.setItems(mActiveConnectors);
                        mActiveConnectorAdapter.notifyDataSetChanged();
                        //mActiveConnectorAdapter.notifyItemInserted(mActiveConnectors.indexOf(toShow));
                        //salvo nel connettore la sua posizione nella lista di connettori attivi
                        toShow.setPosition(mActiveConnectorAdapter.getItemCount()-1);
                    }
                }
                break;
            }
        }
    }

    @Override
    public void onBackPressed() {
        super.onBackPressed();
        inputUpdateWf.clear();
    }
    //TODO: assicurati che gli indici e dimensioni tra le due liste siano coerenti
    public void removeConnectorFromActive(Connector cn,int position) {


        Log.i("ANDREA POSITION",String.valueOf(position));
        Log.i("ANDREA InputUWF size",String.valueOf(inputUpdateWf.size()));
        Log.i("ANDREA mActiveConn size",String.valueOf(mActiveConnectors.size()));

        inputUpdateWf.remove(position);

        mActiveConnectors.remove(position);
        mActiveConnectorAdapter.setItems(mActiveConnectors);
        mActiveConnectorAdapter.notifyDataSetChanged();
        //mActiveConnectorAdapter.notifyItemRemoved(position);

    }

    public void setActiveConnector(Connector cn, int position) {
        Intent intent = new Intent(ConnectorActivity.this, SetConnectorActivity.class);
        intent.putExtra("connector",cn);
        if(inputUpdateWf.get(position)!=null) {
            intent.putExtra("parameters", inputUpdateWf.get(position));
        }
        ConnectorActivity.this.startActivity(intent);
    }

    //query di update per wf corrente
    //TODO: callback
    public void saveEdit(View view) {
        UpdateUserInput input = UpdateUserInput.builder()
                .id(AWSMobileClient.getInstance().getUsername())
                .workflow(updateWfDefinition())
                .build();
        UpdateUserMutation updateUserMutation = UpdateUserMutation.builder()
                .input(input)
                .build();
        com.example.testcognito.ClientFactory.appSyncClient().mutate(updateUserMutation).enqueue(null);
    Toast.makeText(ConnectorActivity.this,"Workflow saved!",Toast.LENGTH_LONG).show();
    }

    //aggiorna il workflow corrente con i connettori settati e restituisce la lista di workflow
    //è più un "copia modifica e sostituisci" wf
    //TODO: attaccare i nuovi connettori a quelli vecchi gia presenti
    public List<WorkflowInput> updateWfDefinition() {
        WorkflowInput aux = MainActivity.wfList.get(currentWfPos);
        WorkflowInput toUpdate = WorkflowInput.builder()
                .idwf(aux.idwf())
                .def(createWFdef(inputUpdateWf).toString()
                        .replace("\\","")
                        .replace("records\":[\"","records\":[")
                        .replace("}\"]}","}]}")
                        .replace("}\",\"{\"action","},{\"action"))
                .name(aux.name())
                .build();

        MainActivity.wfList.add(currentWfPos,toUpdate);

        if(MainActivity.wfList.get(currentWfPos+1)!=null) {
            MainActivity.wfList.remove(currentWfPos+1);
        }
        Log.i("ANDREA UPDATE", inputUpdateWf.toString());
        return MainActivity.wfList;
    }

    public JSONObject createWFdef(List<String> list) {
        Map<String, Object> m = new HashMap<>();
        m.put("actions_records",list);
        JSONObject j = new JSONObject(m);
        return j;
    }

    public void retrieveUserConnectors () {
        com.example.testcognito.ClientFactory.appSyncClient()
                .query(GetUserQuery.builder().id(AWSMobileClient.getInstance().getUsername()).build())
                .responseFetcher(AppSyncResponseFetchers.CACHE_AND_NETWORK)
                .enqueue(getConnListCallback);
    }

    //isolo il workflow e estraggo i connettori e relativi parametri
    private GraphQLCall.Callback<GetUserQuery.Data> getConnListCallback = new GraphQLCall.Callback<GetUserQuery.Data>() {
        @Override
        public void onResponse(@Nonnull Response<GetUserQuery.Data> response) {
            if(response!=null && response.data()!=null && response.data().getUser()!=null) {
                if (response.data().getUser().workflow() != null) {
                    List<Connector> auxWfList = new ArrayList<>();
                    for(GetUserQuery.Workflow w : response.data().getUser().workflow())
                    {
                        if(w.idwf().equals(MainActivity.wfList.get(currentWfPos).idwf())) {
                            Log.i("ANDREA FINDWF", w.def());
                            try {
                                JSONObject j = new JSONObject(w.def());
                                JSONArray jsonArray = j.getJSONArray("actions_records");
                                Log.i("ANDREA JSONARRAY", jsonArray.toString(1));
                                showConnectors(jsonArray);
                            } catch (JSONException e)
                            {
                                Log.i("ANDREA JSON",e.getMessage());
                            }
                        }
                    }
                }
            }
        }
        @Override
        public void onFailure(@Nonnull ApolloException e) {
            Log.e("ERROR", e.toString());
        }
    };

    public void showConnectors(JSONArray jsonArray) {
        inputUpdateWf.clear();
        ArrayList<Connector> auxConnList = new ArrayList<>();
        Log.i("ANDREA LENGHT JARRAY",String.valueOf(jsonArray.length()));
        for(int i=0; i<jsonArray.length(); i++) {
            try {
                String action = new JSONObject(jsonArray.get(i).toString()).getString("action");
                Connector cn;
                      cn =   new Connector.ConnectorBuilder()
                                .action(action)
                                .name(actionToName(action))
                                .type(action)
                                .position(i)
                                .build();
                      cn.setBeenSet(true);

                      cn = normalizeFields(cn);
                auxConnList.add(cn);

                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mActiveConnectorAdapter.setItems(auxConnList);
                        mActiveConnectorAdapter.notifyDataSetChanged();
                        //Log.i("ANDREA POS RETRIEVE",String.valueOf(cn.getPosition()));
                    }
                });

                inputUpdateWf.add(jsonArray.get(i).toString());
                Log.i("ANDREA IWF SIZE",String.valueOf(inputUpdateWf.size()));

            }catch (JSONException e) {
                Log.i("ANDREA",e.getMessage());
            }
        }
        mActiveConnectors=auxConnList;
    }
    //funzioni per coerenza con connettori nel DB
    public String actionToName(String action) {
        switch(action) {
            case "read_feed":
                return "Feed RSS";
            case "custom_message":
                return "Custom Message";
            case "weather":
                return "Weather";
            case "read_tweet":
                return "Read Tweet";
            case "write_tweet":
                return "Write Tweet";
            case "tv_schedule":
                return "TV Schedule";
        }
        return "missing name";
    }

    public Connector normalizeFields(Connector cn) {
        switch(cn.getAction()) {
            case "read_feed":
                cn.addField("URL");
                return cn;
            case "custom_message":
                cn.addField("Message body");
                return cn;
            case "weather":
                cn.addField("Longitude");
                cn.addField("Latitude");
                return cn;
            case "read_tweet":
                cn.addField("account name (es. @unipd)");
                return cn;
            case "write_tweet":
                cn.addField("Tweet body");
                return cn;
            case "tv_schedule":
                cn.addField("Message body");
                return cn;
        }
        return cn;
    }

}