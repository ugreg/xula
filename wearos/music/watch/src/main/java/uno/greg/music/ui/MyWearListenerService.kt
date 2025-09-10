package uno.greg.music.ui

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import com.google.android.gms.wearable.Asset
import com.google.android.gms.wearable.DataEvent
import com.google.android.gms.wearable.DataEventBuffer
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.MessageClient
import com.google.android.gms.wearable.MessageEvent
import com.google.android.gms.wearable.Wearable
import com.google.android.gms.wearable.WearableListenerService
import uno.greg.music.R
import java.io.File

class MyWearListenerService() : WearableListenerService() {

    companion object {
        private const val TAG = "WatchApp"
        const val HELLO_MESSAGE_PATH = "/hello_message"
        const val MP_MESSAGE_PATH = "/mp"
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
    override fun onDataChanged(dataEvents: DataEventBuffer) {
        Log.d(TAG, "Data change for music")
        for (event in dataEvents) {
            if (event.type == DataEvent.TYPE_CHANGED) {
                val item = event.dataItem
                if (item.uri.path == "/musicfile") {
                    val dataMap = DataMapItem.fromDataItem(item).dataMap
                    val asset = dataMap.getAsset("file")
                    val filename = dataMap.getString("filename")
                    asset?.let { saveAssetToFile(it, filename ?: "music.mp3") }
                }
            }
        }
    }

    private fun saveAssetToFile(asset: Asset, filename: String) {
        Log.d(TAG, "Saving music")
        val directory = File("/storage/emulated/0/Download/Test")
        val task = Wearable.getDataClient(this).getFdForAsset(asset)
        task.addOnSuccessListener { result ->
            result.inputStream.use { input ->
                Log.d(TAG, "Some dir ${filesDir}")
                val outFile = File(filesDir, filename)
//                outFile.outputStream().use { output ->
//                    input.copyTo(output)
//                }
                Log.d("WearDebug", "File received and saved: ${outFile.absolutePath}")
            }
        }.addOnFailureListener {
            Log.e("WearDebug", "Failed to load asset", it)
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