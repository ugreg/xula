package uno.greg.music.ui

import android.content.Intent
import android.os.Bundle
import android.util.Log
import com.google.android.gms.wearable.WearableListenerService
import com.google.android.gms.wearable.MessageEvent
import uno.greg.music.R

class MyWearListenerService : WearableListenerService() {

    override fun onCreate() {
        Log.d("WearDebug", "Service runningnnnignigniignignign")
    }

    override fun onMessageReceived(event: MessageEvent) {
        Log.d("WearDebug", "Message received: path=${event.path}, data=${String(event.data)}")

        if (event.path == "/open-app") {
            Log.d("WearDebug", "Handling /open-app message")
            val intent = packageManager.getLaunchIntentForPackage(packageName)
            intent?.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
            startActivity(intent)
        }
    }
}