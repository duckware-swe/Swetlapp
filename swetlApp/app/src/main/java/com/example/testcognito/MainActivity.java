package com.example.testcognito;
// prova commit
import android.content.Intent;
import android.os.Bundle;
import android.support.design.widget.FloatingActionButton;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.LinearLayoutManager;
import android.support.v7.widget.RecyclerView;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;

import com.amazonaws.amplify.generated.graphql.CreateUserMutation;
import com.amazonaws.amplify.generated.graphql.GetUserQuery;
import com.amazonaws.mobile.auth.core.IdentityManager;
import com.amazonaws.mobile.client.AWSMobileClient;
import com.amazonaws.mobile.client.SignInUIOptions;
import com.amazonaws.mobileconnectors.appsync.fetcher.AppSyncResponseFetchers;
import com.apollographql.apollo.GraphQLCall;
import com.apollographql.apollo.api.Response;
import com.apollographql.apollo.exception.ApolloException;

import java.util.ArrayList;
import java.util.List;

import javax.annotation.Nonnull;

import type.CreateUserInput;
import type.WorkflowInput;

public class MainActivity extends AppCompatActivity {

    public RecyclerView mRecyclerView;
    public com.example.testcognito.WorkflowAdapter mAdapter;
    private GraphQLCall.Callback<CreateUserMutation.Data> mutationCallback;
    public static List<WorkflowInput> wfList = new ArrayList<>();

    private final String TAG = MainActivity.class.getSimpleName();

    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        mRecyclerView = findViewById(R.id.recycler_view);

        // use a linear layout manager
        mRecyclerView.setLayoutManager(new LinearLayoutManager(this));

        // specify an adapter (see also next example)
        mAdapter = new com.example.testcognito.WorkflowAdapter(this);
        mRecyclerView.setAdapter(mAdapter);

        com.example.testcognito.ClientFactory.init(this);

        initializeUser();

        //bottone + fa partire activity di aggiunta nuovo workflow
        FloatingActionButton btnAddWorkflow = findViewById(R.id.btn_addWorkflow);
        btnAddWorkflow.setOnClickListener(new View.OnClickListener() {

            @Override
            public void onClick(View view) {
                Intent addWorkflowIntent = new Intent(MainActivity.this, AddWorkflowActivity.class);
                MainActivity.this.startActivity(addWorkflowIntent);
            }
        });
    }

    @Override
    public void onResume() {
        super.onResume();
        // aggiorna la lista di workflow
        queryWfList();

    }

    //optionMenu, per ora lo utilizzo per mettere il bottone di logout(che va male)
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return super.onCreateOptionsMenu(menu);
    }
    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            case R.id.action_logout: {
                //Intent i = new Intent(MainActivity.this, AuthenticationActivity.class);
                AWSMobileClient.getInstance().signOut();
                //IdentityManager.getDefaultIdentityManager().signOut();
               // startActivity(i);
                return true;
            }
            default:
                // If we got here, the user's action was not recognized.
                // Invoke the superclass to handle it.
                return super.onOptionsItemSelected(item);
        }
    }
    //ottiene la lista di workFlow dell'utente collegato
    public void queryWfList(){
        com.example.testcognito.ClientFactory.appSyncClient()
                .query(GetUserQuery.builder()
                        .id(AWSMobileClient.getInstance().getUsername())
                        .build())
                .responseFetcher(AppSyncResponseFetchers.CACHE_AND_NETWORK)
                .enqueue(getWfListCallback);
    }
    //callBack della query soprastante, copia la lista di wf ottenuta in wfList
    private GraphQLCall.Callback<GetUserQuery.Data> getWfListCallback = new GraphQLCall.Callback<GetUserQuery.Data>() {
        @Override
        public void onResponse(@Nonnull Response<GetUserQuery.Data> response) {
            if(response!=null && response.data()!=null && response.data().getUser()!=null) {
                if (response.data().getUser().workflow() != null) {
                    List<WorkflowInput> auxWfList = new ArrayList<>();
                    for (GetUserQuery.Workflow wf : response.data().getUser().workflow()) {
                        auxWfList.add(WorkflowInput.builder()
                                .idwf(wf.idwf())
                                .name(wf.name())
                                .def(wf.def())
                                .build());
                    }
                    wfList=auxWfList;
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            mAdapter.setItems(wfList);
                            mAdapter.notifyDataSetChanged();
                        }
                    });
                }
            }
        }
        @Override
        public void onFailure(@Nonnull ApolloException e) {
            Log.e("ERROR", e.toString());
        }
    };

    public static void initializeUser(){
        String nickName = AWSMobileClient.getInstance().getUsername();
        try {
            //bisognerebbe settare given name obbligatorio da console cognito, questo è solo un workaround
             nickName = AWSMobileClient.getInstance().getTokens().getIdToken().getClaim("given_name") != null
                    ? AWSMobileClient.getInstance().getTokens().getIdToken().getClaim("given_name")
                    : AWSMobileClient.getInstance().getUsername();
        }catch(Exception e){

            //TODO: probabilmente qua se l utente non fornisce nickname succedono casini
            //AWSMobileClient.getInstance().signOut();
            Log.i("ANDREA exception",e.getLocalizedMessage());
        }finally {
            CreateUserInput input = CreateUserInput.builder()
                    .id(AWSMobileClient.getInstance().getUsername())
                    .name(nickName)
                    .build();

            CreateUserMutation addUserMutation = CreateUserMutation.builder()
                    .input(input)
                    .build();
            com.example.testcognito.ClientFactory.appSyncClient().mutate(addUserMutation).enqueue(null);

        }


    }

}