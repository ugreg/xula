package uno.greg.music.ui

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import com.google.android.gms.wearable.MessageClient
import com.google.android.gms.wearable.MessageEvent
import com.google.android.gms.wearable.Wearable
import com.google.android.gms.wearable.WearableListenerService
import uno.greg.music.R

class MyWearListenerService() : WearableListenerService() {

    companion object {
        private const val TAG = "WatchApp"
        const val HELLO_MESSAGE_PATH = "/hello_message"
    }

    override fun onMessageReceived(messageEvent: MessageEvent) {
        Log.d(TAG, "Message received: path=${messageEvent.path}")
        Log.d("WatchApp", "Top of message get")
        when (messageEvent.path) {
            HELLO_MESSAGE_PATH -> {
                val message = String(messageEvent.data)
                Log.d(TAG, "Message received: $message")
            }
        }
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