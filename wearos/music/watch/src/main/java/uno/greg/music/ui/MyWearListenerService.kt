package uno.greg.music.ui

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import com.google.android.gms.wearable.MessageClient
import com.google.android.gms.wearable.WearableListenerService
import com.google.android.gms.wearable.MessageEvent
import com.google.android.gms.wearable.Wearable
import uno.greg.music.R

class MyWearListenerService(
    private val context: Context,
    private val onMessageReceived: (String) -> Unit = { message ->
        Log.d("WatchApp", "Received: $message")
    }
) : MessageClient.OnMessageReceivedListener {

    private val messageClient = Wearable.getMessageClient(context)

    companion object {
        private const val TAG = "WatchApp"
        const val HELLO_MESSAGE_PATH = "/hello_message"
    }

    init {
        messageClient.addListener(this)
    }

    override fun onMessageReceived(messageEvent: MessageEvent) {
        when (messageEvent.path) {
            HELLO_MESSAGE_PATH -> {
                val message = String(messageEvent.data)
                Log.d(TAG, "Message received: $message")
                onMessageReceived(message)
            }
        }
    }

    fun cleanup() {
        messageClient.removeListener(this)
    }
//    override fun onMessageReceived(event: MessageEvent) {
//        Log.d("WearDebug", "Message received: path=${event.path}, data=${String(event.data)}")
//
////        if (event.path == "/open-app") {
////            Log.d("WearDebug", "Handling /open-app message")
////            val intent = packageManager.getLaunchIntentForPackage(packageName)
////            intent?.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
////            startActivity(intent)
////        }
//
//        when (event.path) {
//            "/hello_message" -> {
//                val message = String(event.data)
//                Log.d("Uno wear os", "Hello message received: $message")
//            }
//        }
//    }
}