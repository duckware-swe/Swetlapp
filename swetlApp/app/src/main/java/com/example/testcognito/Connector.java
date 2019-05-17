package com.example.testcognito;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class Connector implements Serializable {

    private String cnName;
    private String cnType;
    private String cnAction;
    private Integer paramNumber;
    private Integer cnPosition;
    private Boolean beenSet;
    private List<String> paramFields;
    private String param1;
    private String param2;
    private String param3;
    private int imgRes;
    public static class ConnectorBuilder {
        //TODO: pulisci attributi inutili
        private String cnName;
        private String cnType;
        private String cnAction;
        private Integer paramNumber;
        private Integer cnPosition;
        private List<String> paramFields= new ArrayList<>();
        private String param1;
        private String param2;
        private String param3;
        private int imgRes;


        public Connector build() {
            return new Connector(cnName,cnType,cnAction,paramFields,paramNumber,cnPosition,param1,param2,param3,imgRes);
        }
        public ConnectorBuilder name(String name) {
            this.cnName = name;
            return this;
        }

        public ConnectorBuilder type(String type) {
            this.cnType = type;
            return this;
        }

        public ConnectorBuilder action(String action) {
            this.cnAction = action;
            return this;
        }

        public ConnectorBuilder paramNumber(Integer number) {
            this.paramNumber = number;
            return this;
        }

        public ConnectorBuilder position(Integer position) {
            this.cnPosition = position;
            return this;
        }

        public ConnectorBuilder addField(String field) {
            this.paramFields.add(field);
            return this;
        }

        public ConnectorBuilder parameter1(String param) {
            this.param1 = param;
            return this;
        }

        public ConnectorBuilder parameter2(String param) {
            this.param2 = param;
            return this;
        }

        public ConnectorBuilder parameter3(String param) {
            this.param3 = param;
            return this;
        }

        public ConnectorBuilder imgRes(int imgRes) {
            this.imgRes=imgRes;
            return this;
        }
    }
    private Connector(String cnName, String cnType, String cnDef, List<String> paramFields,
                      Integer paramNumber, Integer cnPosition, String param1, String param2,
                      String param3,int imgRes) {
        this.cnName=cnName;
        this.cnType=cnType;
        this.cnAction =cnDef;
        this.paramFields=paramFields;
        this.paramNumber=paramNumber;
        this.cnPosition=cnPosition;
        this.param1=param1;
        this.param2=param2;
        this.param3=param3;
        this.beenSet=false;
        this.imgRes=imgRes;
    }




    @Override
    public String toString() {
        return cnName;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj == this)
            return true;

        if (!(obj instanceof Connector))
            return false;

        Connector cn = (Connector) obj;
        return cn.cnName.equals(cnName) && cn.cnAction.equals(cnAction) && cn.cnType.equals(cnType);
    }

    @Override
    public int hashCode() {
        int res = 17;
        res = 31 * res + cnName.hashCode();
        res = 31 * res + cnAction.hashCode();
        return res;
    }

    public String getType() {
        return cnType;
    }

    public int getImgSrc() {return imgRes; }

    public String getName() {
        return cnName;
    }

    public String getAction() { return cnAction;}

    public List<String> getFields() { return paramFields;}

    public void setPosition(int pos) { cnPosition=pos; }

    public void setBeenSet(Boolean bS) {
        beenSet=bS;
    }

    public void addField(String field) { paramFields.add(field); }

    public Boolean getBeenSet() { return beenSet;}

    public int getPosition() { return cnPosition; }

    public Integer getParamNumber() {return paramNumber;}
}