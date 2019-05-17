package com.example.testcognito;


import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.RecyclerView;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;
import com.example.testcognito.Connector;
import java.util.List;

public class AvailableConnectorRecycleViewAdapter extends RecyclerView.Adapter<AvailableConnectorRecycleViewAdapter.ViewHolder> {

    private final List<Connector> mConnector;

    private final ConnectorActivity activity;

    public AvailableConnectorRecycleViewAdapter(List<Connector> connectors,
                                                ConnectorActivity activity) {
        this.mConnector = connectors;
        this.activity = activity;
    }

    @Override
    public ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.list_item_connector_available, parent, false);

        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(ViewHolder holder, int position) {
        holder.connector = mConnector.get(position);

        holder.connectorName.setText( mConnector.get(position).toString() );
        holder.imageView.setImageResource(mConnector.get(position).getImgSrc());
        //add connector to active
        holder.connectorAdd.setOnClickListener(view -> {
            activity.findViewById(R.id.buttonSaveConnectors).setVisibility(View.VISIBLE);

            Connector cn = mConnector.get(holder.getAdapterPosition());
            /*Connector cn = new Connector.ConnectorBuilder()
                    .name(holder.connectorName.getText().toString())
                    .type(holder.connector.getType())
                    .build();*/
            activity.addConnectorToActive(cn);
        });
    }

    @Override
    public int getItemCount() {
        return mConnector.size();
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {

        public final View parentView;
        public final TextView connectorName;
        public final Button connectorAdd;
        public Connector connector;
        public ImageView imageView;

        public ViewHolder(View itemView) {
            super(itemView);
            this.parentView = itemView;
            this.imageView = itemView.findViewById(R.id.imageView);
            this.connectorName = itemView.findViewById(R.id.list_item_activeconnector_name);
            this.connectorAdd = itemView.findViewById(R.id.buttonAddConnector);
        }

        @Override
        public String toString() {
            return super.toString() + " '" + connectorName.getText() + "'";
        }
    }

}