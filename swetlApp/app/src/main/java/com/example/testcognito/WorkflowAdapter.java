package com.example.testcognito;

import android.content.Context;
import android.content.Intent;
import android.support.v7.widget.RecyclerView;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import com.amazonaws.amplify.generated.graphql.UpdateUserMutation;
import com.amazonaws.mobile.client.AWSMobileClient;
import com.apollographql.apollo.GraphQLCall;
import com.apollographql.apollo.api.Response;
import com.apollographql.apollo.exception.ApolloException;

import java.util.ArrayList;
import java.util.List;

import javax.annotation.Nonnull;

import type.UpdateUserInput;
import type.WorkflowInput;


public class WorkflowAdapter extends RecyclerView.Adapter<WorkflowAdapter.ViewHolder> {

    private List<WorkflowInput> mData = new ArrayList<>();;
    private LayoutInflater mInflater;

    //to start activity from adapter
    private Context context;
   // private GraphQLCall.Callback<DeleteWorkflowMutation.Data> mutationCallback;

    // data is passed into the constructor
    WorkflowAdapter(Context context) {
        this.mInflater = LayoutInflater.from(context);
        this.context=context;
    }

    // inflates the row layout from xml when needed
    @Override
    public ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View view = mInflater.inflate(R.layout.workflow_row, parent, false);
        return new ViewHolder(view);
    }

    // binds the data to the TextView in each row
    @Override
    public void onBindViewHolder(ViewHolder holder, int position) {
        holder.bindData(mData.get(position));
    }

    // total number of rows
    @Override
    public int getItemCount() {
        return mData.size();
    }

    // resets the list with a new set of data
    public void setItems(List<WorkflowInput> items) {
        mData = items;
    }

    // stores and recycles views as they are scrolled off screen
    class ViewHolder extends RecyclerView.ViewHolder {
        TextView txt_name;
        TextView txt_description;
        Button delete;
        Button set;

        ViewHolder(View itemView) {
            super(itemView);
            txt_name = itemView.findViewById(R.id.txt_name);

            delete = itemView.findViewById(R.id.delete_button);

            delete.setOnClickListener(new View.OnClickListener() {
            //update user > delete workflow
                @Override
                public void onClick(View view) {
                    Toast.makeText( view.getContext(), MainActivity.wfList.get(getAdapterPosition()).name()+" eliminato", Toast.LENGTH_SHORT).show();
                    MainActivity.wfList.remove(0);
                    ConnectorActivity.inputUpdateWf.clear();
                    UpdateUserInput updateUserInput = UpdateUserInput.builder()
                            .id(AWSMobileClient.getInstance().getUsername())
                            .workflow(MainActivity.wfList)
                            .build();
                    ClientFactory.appSyncClient().mutate(UpdateUserMutation.builder().input(updateUserInput).build())
                            .enqueue(mutationCallback);
                    removeAt(getAdapterPosition());
                }
            });
            //fa partire attività di selezioen e impostazione connettori
            set = itemView.findViewById(R.id.setwf_button2);
            set.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    Intent intent = new Intent(context , ConnectorActivity.class);
                    intent.putExtra("currentWfpos",getAdapterPosition());
                    context.startActivity(intent);
                }
            });
        }

        //callback per cancallazione workflow
        private GraphQLCall.Callback<UpdateUserMutation.Data> mutationCallback = new GraphQLCall.Callback<UpdateUserMutation.Data>() {
            @Override
            public void onResponse(@Nonnull Response<UpdateUserMutation.Data> response) {
                Log.i("Results", "Deleted workflow");
            }

            @Override
            public void onFailure(@Nonnull ApolloException e) {
                Log.e("Error", e.toString());
            }
        };
        void bindData(WorkflowInput item) {
            txt_name.setText(item.name());
        }
    }

    public void removeAt(int position) {
        notifyItemRemoved(position);
        notifyItemRangeChanged(position, mData.size());
    }
}