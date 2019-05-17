package com.example.testcognito;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.Location;
import android.net.Uri;
import android.provider.Settings;
import android.support.annotation.NonNull;
import android.support.design.widget.Snackbar;
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

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.Task;
import com.google.gson.JsonObject;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public class SetConnectorActivity extends AppCompatActivity {



    private static final String TAG = MainActivity.class.getSimpleName();

    private static final int REQUEST_PERMISSIONS_REQUEST_CODE = 34;

    /**
     * Provides the entry point to the Fused Location Provider API.
     */
    private FusedLocationProviderClient mFusedLocationClient;

    /**
     * Represents a geographical location.
     */
    protected Location mLastLocation;

    private String mLatitudeLabel;
    private String mLongitudeLabel;
    private TextView mLatitudeText;
    private TextView mLongitudeText;
    
    private List<String> fieldList = new ArrayList<>();
    private List<String> paramList = new ArrayList<>();
    private Connector connector;
    private RecyclerView mRecyclerView ;
    private ConnParametersRecycleViewAdapter mAdapter;
    private FusedLocationProviderClient fusedLocationClient;
    private Boolean cnSetted;
    private String exParameters;
    @Override
    protected void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);

        connector = (Connector) getIntent().getSerializableExtra("connector");
        exParameters = getIntent().getStringExtra("parameters");
            setContentView(R.layout.activity_set_connector);

            fieldList = connector.getFields();
            mAdapter = new ConnParametersRecycleViewAdapter(fieldList, this,exParameters);

            //RecyclerView setup - available connectors
            mRecyclerView = findViewById(R.id.recycler_view);
            mRecyclerView.setLayoutManager(new LinearLayoutManager(getApplicationContext()));
            mRecyclerView.setAdapter(mAdapter);

            if(exParameters!=null)
            Log.i("ANDREA EXPARAM",exParameters);
            //Mostra le view (edittext) in cui digitare i valori per i campi parametri dei connettori
            setFields();

        mFusedLocationClient = LocationServices.getFusedLocationProviderClient(this);

    }
    @Override
    public void onStart() {
        super.onStart();

            if(connector.getAction().equals("weather")) {
                Log.i("ANDREA ACTION", connector.getAction());
                if (!checkPermissions()) {
                    requestPermissions();
                } else {
                    getLastLocation();
                }
            }

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
        if (!pList.isEmpty()) {
            try {
                //creo JSON del connettore
                JSONObject jsonObject = buildJsonConn(connector,pList);
                Log.i("ANDREA JSON", jsonObject.toString(1));

                connector.setBeenSet(true);
                cnSetted=true;
                //lo salvo nella lista inputUpdateWf
                ConnectorActivity.inputUpdateWf.add(jsonObject.toString());
                Log.i("ANDREA UPDATE", ConnectorActivity.inputUpdateWf.toString());

                //sostituisco i parametri del connettore vecchio se presente
                //TODO: aggiornamento connettori
            /*if(ConnectorActivity.inputUpdateWf.get(connector.getPosition()+1)!=null)
                ConnectorActivity.inputUpdateWf.remove(connector.getPosition()+1);*/
            } catch (JSONException e) {
                Log.i("ANDREA JSON", e.getMessage());
            }
            Intent resultIntent = new Intent();
            resultIntent.putExtra("cnSetted", cnSetted);
            resultIntent.putExtra("cn",connector);
            setResult(Activity.RESULT_OK, resultIntent);
            SetConnectorActivity.this.finish();
        }
        else
            Toast.makeText(SetConnectorActivity.this,
                    "Please provide the fields with some input",Toast.LENGTH_LONG).show();
    }

    public JSONObject buildJsonConn(Connector c, List<String> pL) {
        Map<String, Object> connMap = new HashMap<>();
        connMap.put("action",c.getAction());
        connMap.put("params",pL);
        JSONObject jsonObject = new JSONObject(connMap);
        return jsonObject;
    }
    //esempio formato json parametri
    //{\"actions_records\":[{\"action\":\"tv_schedule\",\"params\":[\"cielo\",\"19:00\"]}]}


    //
    @SuppressWarnings("MissingPermission")
    private void getLastLocation() {
        mFusedLocationClient.getLastLocation()
                .addOnCompleteListener(this, new OnCompleteListener<Location>() {
                    @Override
                    public void onComplete(@NonNull Task<Location> task) {
                        if (task.isSuccessful() && task.getResult() != null) {
                            mLastLocation = task.getResult();
                            /*List<String> coordinates = new ArrayList<>();
                            coordinates.add(String.valueOf(mLastLocation.getLatitude()));
                            coordinates.add(String.valueOf(mLastLocation.getLongitude()));
                            ConnectorActivity.inputUpdateWf.add(buildJsonConn(connector,coordinates).toString());
                            mLatitudeText.setText(String.format(Locale.ENGLISH, "%s: %f",
                                    mLatitudeLabel,
                                    mLastLocation.getLatitude()));
                            mLongitudeText.setText(String.format(Locale.ENGLISH, "%s: %f",
                                    mLongitudeLabel,
                                    mLastLocation.getLongitude()));*/
                            mAdapter.setLocation(mLastLocation.getLongitude(),mLastLocation.getLatitude());
                            mAdapter.notifyDataSetChanged();
                        } else {
                            Log.w(TAG, "getLastLocation:exception", task.getException());
                            showSnackbar(getString(R.string.no_location_detected));
                        }
                    }
                });
    }

    private void showSnackbar(final String text) {
        View container = findViewById(R.id.set_connector_activity_container);
        if (container != null) {
            Snackbar.make(container, text, Snackbar.LENGTH_LONG).show();
        }
    }

    private void showSnackbar(final int mainTextStringId, final int actionStringId,
                              View.OnClickListener listener) {
        Snackbar.make(findViewById(android.R.id.content),
                getString(mainTextStringId),
                Snackbar.LENGTH_INDEFINITE)
                .setAction(getString(actionStringId), listener).show();
    }

    /**
     * Return the current state of the permissions needed.
     */
    private boolean checkPermissions() {
        int permissionState = ActivityCompat.checkSelfPermission(this,
                Manifest.permission.ACCESS_FINE_LOCATION);
        return permissionState == PackageManager.PERMISSION_GRANTED;
    }

    private void startLocationPermissionRequest() {
        ActivityCompat.requestPermissions(SetConnectorActivity.this,
                new String[]{Manifest.permission.ACCESS_FINE_LOCATION},
                REQUEST_PERMISSIONS_REQUEST_CODE);
    }

    private void requestPermissions() {
        boolean shouldProvideRationale =
                ActivityCompat.shouldShowRequestPermissionRationale(this,
                        Manifest.permission.ACCESS_FINE_LOCATION);

        // Provide an additional rationale to the user. This would happen if the user denied the
        // request previously, but didn't check the "Don't ask again" checkbox.
        if (shouldProvideRationale) {
            Log.i(TAG, "Displaying permission rationale to provide additional context.");

            showSnackbar(R.string.permission_rationale, android.R.string.ok,
                    new View.OnClickListener() {
                        @Override
                        public void onClick(View view) {
                            // Request permission
                            startLocationPermissionRequest();
                        }
                    });

        } else {
            Log.i(TAG, "Requesting permission");
            // Request permission. It's possible this can be auto answered if device policy
            // sets the permission in a given state or the user denied the permission
            // previously and checked "Never ask again".
            startLocationPermissionRequest();
        }
    }
    /**
     * Callback received when a permissions request has been completed.
     */
    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions,
                                           @NonNull int[] grantResults) {
        Log.i(TAG, "onRequestPermissionResult");
        if (requestCode == REQUEST_PERMISSIONS_REQUEST_CODE) {
            if (grantResults.length <= 0) {
                // If user interaction was interrupted, the permission request is cancelled and you
                // receive empty arrays.
                Log.i(TAG, "User interaction was cancelled.");
            } else if (grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                // Permission granted.
                getLastLocation();
            }

            //TODO: decidi se rendere obbligatorio o no l accesso alla posizione
            /*else {
                // Permission denied.

                // Notify the user via a SnackBar that they have rejected a core permission for the
                // app, which makes the Activity useless. In a real app, core permissions would
                // typically be best requested during a welcome-screen flow.

                // Additionally, it is important to remember that a permission might have been
                // rejected without asking the user for permission (device policy or "Never ask
                // again" prompts). Therefore, a user interface affordance is typically implemented
                // when permissions are denied. Otherwise, your app could appear unresponsive to
                // touches or interactions which have required permissions.
                showSnackbar(R.string.permission_denied_explanation, R.string.settings,
                        new View.OnClickListener() {
                            @Override
                            public void onClick(View view) {
                                // Build intent that displays the App settings screen.
                                Intent intent = new Intent();
                                intent.setAction(
                                        Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                                Uri uri = Uri.fromParts("package",
                                        BuildConfig.APPLICATION_ID, null);
                                intent.setData(uri);
                                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                                startActivity(intent);
                            }
                        });
            }*/
        }
    }
}
