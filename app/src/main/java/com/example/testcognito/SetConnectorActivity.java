package com.example.testcognito;

import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.support.v7.widget.LinearLayoutManager;
import android.support.v7.widget.RecyclerView;
import android.util.Log;
import android.view.View;

import com.google.gson.JsonObject;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SetConnectorActivity extends AppCompatActivity {
    
    private List<String> fieldList = new ArrayList<>();
    private List<String> paramList = new ArrayList<>();
    private Connector connector;
    private RecyclerView mRecyclerView ;
    private ConnParametersRecycleViewAdapter mAdapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_set_connector);
        connector= (Connector) getIntent().getSerializableExtra("connector");
        fieldList = connector.getFields();
        mAdapter = new ConnParametersRecycleViewAdapter(fieldList,this);

        //RecyclerView setup - available connectors
        mRecyclerView = findViewById(R.id.recycler_view);
        mRecyclerView.setLayoutManager(new LinearLayoutManager(getApplicationContext()));
        mRecyclerView.setAdapter(mAdapter);

        //Mostra le view (edittext) in cui digitare i valori per i campi parametri dei connettori
        setFields();
    }
    
    public void setFields() {
        Log.i("ANDREANUMERO FIELDS",String.valueOf(fieldList.size()));

        for(String s: fieldList) {
            mAdapter.notifyItemInserted(0);
        }
    }

    //aggiunge o modifica parametri connettore e li salva in una lista
    // utilizzata da connectorActivity
    public void saveAllParameters(View view) {
        List <String> pList = mAdapter.retrieveParameters();
        try {
            //creo JSON del connettore
            Map<String, Object> connMap = new HashMap<>();
            connMap.put("action",connector.getAction());
            connMap.put("params",pList);
            JSONObject jsonObject = new JSONObject(connMap);
            Log.i("ANDREA JSON", jsonObject.toString(1));

            //lo salvo nella lista inputUpdateWf
            ConnectorActivity.inputUpdateWf.add(jsonObject.toString());
            Log.i("ANDREA UPDATE", ConnectorActivity.inputUpdateWf.toString());

            //sostituisco i parametri del connettore vecchio se presente
            //TODO: aggiornamento connettori
            /*if(ConnectorActivity.inputUpdateWf.get(connector.getPosition()+1)!=null)
                ConnectorActivity.inputUpdateWf.remove(connector.getPosition()+1);*/
        }
        catch (JSONException e) {
            Log.i("ANDREA JSON",e.getMessage());
        }
        SetConnectorActivity.this.finish();
    }
    //esempio formato json parametri
    //{\"actions_records\":[{\"action\":\"tv_schedule\",\"params\":[\"cielo\",\"19:00\"]}]}
}
