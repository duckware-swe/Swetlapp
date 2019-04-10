package com.example.testcognito;

import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import com.amazonaws.amplify.generated.graphql.UpdateUserMutation;
import com.amazonaws.mobile.client.AWSMobileClient;
import com.apollographql.apollo.GraphQLCall;
import com.apollographql.apollo.api.Response;
import com.apollographql.apollo.exception.ApolloException;

import javax.annotation.Nonnull;

import type.UpdateUserInput;
import type.WorkflowInput;

public class AddWorkflowActivity extends AppCompatActivity {

    private static final String TAG = AddWorkflowActivity.class.getSimpleName();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_add_workflow);

        Button btnAddItem = findViewById(R.id.btn_save);
        btnAddItem.setOnClickListener(new View.OnClickListener() {

            @Override
            public void onClick(View view) {
                    save();
            }
        });
    }

    //costrusico nuovo elemento workflow, lo metto in lista wfList e faccio query di inserimento
    private void save(){
        final String name = ((EditText) findViewById(R.id.editTxt_name)).getText().toString();
        MainActivity.wfList.add(WorkflowInput.builder()
                        .def("Campo descrizione")
                        .idwf(String.valueOf(MainActivity.wfList.hashCode()))
                        .name(name)
                        .build());

        UpdateUserInput input = UpdateUserInput.builder()
                .id(AWSMobileClient.getInstance().getUsername())
                .workflow(MainActivity.wfList)
                .build();

        UpdateUserMutation updateUserMutation =  UpdateUserMutation.builder()
                .input(input)
                .build();
        com.example.testcognito.ClientFactory.appSyncClient().mutate(updateUserMutation).enqueue(mutateCallback);
    }

    // Mutation callback code per aggiunta wf
    private GraphQLCall.Callback<UpdateUserMutation.Data> mutateCallback = new GraphQLCall.Callback<UpdateUserMutation.Data>() {
        @Override
        public void onResponse(@Nonnull final Response<UpdateUserMutation.Data> response) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    Toast.makeText(AddWorkflowActivity.this, "Added Workflow", Toast.LENGTH_SHORT).show();
                    AddWorkflowActivity.this.finish();
                }
            });
        }

        @Override
        public void onFailure(@Nonnull final ApolloException e) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    Log.e("", "Failed to perform AddWorkflowMutation", e);
                    Toast.makeText(AddWorkflowActivity.this, "Failed to add Workflow", Toast.LENGTH_SHORT).show();
                    AddWorkflowActivity.this.finish();
                }
            });
        }
    };
}
