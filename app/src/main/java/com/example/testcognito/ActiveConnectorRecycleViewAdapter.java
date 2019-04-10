package com.example.testcognito;

import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.RecyclerView;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import com.example.testcognito.Connector;
import java.util.List;

import type.WorkflowInput;

public class ActiveConnectorRecycleViewAdapter extends RecyclerView.Adapter<ActiveConnectorRecycleViewAdapter.ViewHolder> {

    private  List<Connector> mConnector;

    private final ConnectorActivity activity;

    public ActiveConnectorRecycleViewAdapter(List<Connector> connectors, ConnectorActivity activity) {
        this.mConnector = connectors;
        this.activity = activity;
    }

    // resets the list with a new set of data
    public void setItems(List<Connector> items) {
        mConnector = items;
    }

    @Override
    public ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.list_item_connector_active, parent, false);

        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(ViewHolder holder, int position) {
        holder.connector = mConnector.get(position);
        Log.i("NUMERO FIELDS ",String.valueOf(holder.connector.getFields().size()));
        holder.connectorName.setText( mConnector.get(position).toString() );

        //remove connector
        holder.connectorRemove.setOnClickListener(view -> {
            activity.findViewById(R.id.buttonSaveConnectors).setVisibility(View.VISIBLE);
            activity.removeConnectorFromActive(holder.connector);
        });

        //set connector
        holder.connectorSet.setOnClickListener(view->{
            activity.setActiveConnector(holder.connector);
        });
    }

    @Override
    public int getItemCount() {
        return mConnector.size();
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {

        public final View parentView;
        public final TextView connectorName;
        public final Button connectorRemove;
        public final Button connectorSet;
        public Connector connector;

        public ViewHolder(View itemView) {
            super(itemView);
            this.parentView = itemView;
            this.connectorName = itemView.findViewById(R.id.list_item_connector_name);
            this.connectorRemove = itemView.findViewById(R.id.buttonRemoveConnector);
            this.connectorSet = itemView.findViewById(R.id.buttonSetConnector);
        }

        @Override
        public String toString() {
            return super.toString() + " '" + connectorName.getText() + "'";
        }
    }

}