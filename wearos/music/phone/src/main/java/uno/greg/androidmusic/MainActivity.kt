package uno.greg.music

import android.os.Bundle
import android.view.Menu
import com.google.android.material.snackbar.Snackbar
import com.google.android.gms.wearable.DataMapItem
import com.google.android.material.navigation.NavigationView
import androidx.navigation.findNavController
import androidx.navigation.ui.AppBarConfiguration
import androidx.navigation.ui.navigateUp
import androidx.navigation.ui.setupActionBarWithNavController
import androidx.navigation.ui.setupWithNavController
import androidx.drawerlayout.widget.DrawerLayout
import androidx.appcompat.app.AppCompatActivity
import uno.greg.music.databinding.ActivityMainBinding
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothSocket
import android.content.Context
import android.content.Intent
import android.util.Log
import android.widget.Toast
import com.google.android.gms.wearable.CapabilityClient
import com.google.android.gms.wearable.DataClient
import com.google.android.gms.wearable.DataEvent
import com.google.android.gms.wearable.DataEventBuffer
import com.google.android.gms.wearable.DataItem
import com.google.android.gms.wearable.MessageEvent
import java.io.File
import java.io.FileInputStream
import java.io.OutputStream
import java.util.concurrent.Executors
import com.google.android.gms.wearable.MessageClient
import kotlin.also
import kotlin.coroutines.cancellation.CancellationException
import com.google.android.gms.wearable.Wearable
import androidx.lifecycle.lifecycleScope
import com.google.android.gms.tasks.Tasks
import com.google.android.gms.wearable.DataMap
import com.google.android.gms.wearable.PutDataMapRequest
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.w3c.dom.Node

class MainActivity : AppCompatActivity(), DataClient.OnDataChangedListener, MessageClient.OnMessageReceivedListener {

    private lateinit var appBarConfiguration: AppBarConfiguration
    private lateinit var binding: ActivityMainBinding

    private val dataClient by lazy { Wearable.getDataClient(this) }
    private val messageClient by lazy { Wearable.getMessageClient(this) }
    private val capabilityClient by lazy { Wearable.getCapabilityClient(this) }

    companion object {
        private const val TAG = "PhoneApp"
        const val HELLO_MESSAGE_PATH = "/hello_message"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.appBarMain.toolbar)

        binding.appBarMain.fab.setOnClickListener { view ->
            Log.d("PhoneApp", "To watch")




//            CoroutineScope(Dispatchers.Main).launch { sendWatch() }
            CoroutineScope(Dispatchers.Main).launch { sendHelloMessage() }





            Snackbar.make(view, "Replace with your own action", Snackbar.LENGTH_LONG)
                .setAction("Action", null)
                .setAnchorView(R.id.fab).show()
        }
        val drawerLayout: DrawerLayout = binding.drawerLayout
        val navView: NavigationView = binding.navView
        val navController = findNavController(R.id.nav_host_fragment_content_main)
        // Passing each menu ID as a set of Ids because each
        // menu should be considered as top level destinations.
        appBarConfiguration = AppBarConfiguration(
            setOf(
                R.id.nav_home, R.id.nav_gallery, R.id.nav_slideshow
            ), drawerLayout
        )
        setupActionBarWithNavController(navController, appBarConfiguration)
        navView.setupWithNavController(navController)
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        // Inflate the menu; this adds items to the action bar if it is present.
        menuInflater.inflate(R.menu.main, menu)
        return true
    }

    override fun onSupportNavigateUp(): Boolean {
        val navController = findNavController(R.id.nav_host_fragment_content_main)
        return navController.navigateUp(appBarConfiguration) || super.onSupportNavigateUp()
    }

    override fun onMessageReceived(messageEvent: MessageEvent) {
        Log.d("PhoneApp", "Message received: ${messageEvent.path}")

        if (messageEvent.path == "/launch") {
            // Launch this app (or specific activity)
            val launchIntent = packageManager.getLaunchIntentForPackage("uno.greg.music")
            launchIntent?.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
            startActivity(launchIntent)
        }
    }

    override fun onDataChanged(dataEvents: DataEventBuffer) {
        Log.d("MainActivity", "DataItem called")
        dataEvents.forEach { event ->
            // DataItem changed
            if (event.type == DataEvent.TYPE_CHANGED) {
                event.dataItem.also { item ->
                    if (item.uri.path?.compareTo("/count") == 0) {
                        Log.d("MainActivity", "DataItem changed path: " + item.uri.path)
                    }
                }
            }
        }
    }

    suspend fun sendWatch() {
        withContext(Dispatchers.IO) {
            try {
                Log.d("PhoneApp", "threadddddd")
                val nodes = Tasks.await(Wearable.getNodeClient(this@MainActivity).connectedNodes)
                for (node in nodes) {
                    Log.d("PhoneApp", "Node ... " + node.id)
                    Log.d("PhoneApp", "Node ... " + node.isNearby)
                    Log.d("PhoneApp", "Node ... " + node.displayName)
                    Tasks.await(
                        Wearable.getMessageClient(this@MainActivity)
                            .sendMessage(node.id, "/open-app", "Hello Wear!".toByteArray())
                    )
                }
            } catch (e: Exception) {
                Log.d("PhoneApp", "Failed to send message to Node ... " + e.toString())
                e.printStackTrace()
            }
        }
    }

    suspend fun sendHelloMessage() {
        withContext(Dispatchers.IO) {
            try {
                val nodes = Tasks.await(Wearable.getNodeClient(this@MainActivity).connectedNodes)

                if (nodes.isEmpty()) {
                    Log.w(TAG, "No Wear OS devices connected")
                } else {
                    nodes.forEach { node ->
                        val message = "Hello from phone! Time: ${System.currentTimeMillis()}"
                        val sendTask = messageClient.sendMessage(node.id, HELLO_MESSAGE_PATH, message.toByteArray())
                        try {
                            Tasks.await(sendTask)
                            Log.d(TAG, "Hello message sent to: ${node.displayName}")
                        } catch (e: Exception) {
                            Log.e(TAG, "Failed to send message to node ${node.displayName}", e)
                        }
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Failed to send hello message", e)
            }
        }
    }
}
