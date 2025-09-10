package uno.greg.music.ui

import android.content.Intent
import android.os.Bundle
import android.os.Environment
import android.util.Log
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.appcompat.app.AppCompatActivity
import com.google.android.gms.wearable.MessageClient
import com.google.android.gms.wearable.MessageEvent
import com.google.android.gms.wearable.Wearable
import uno.greg.music.R

class MainActivity : AppCompatActivity() {
    private lateinit var watchApp: MyWearListenerService

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        val intent = Intent(this, SettingsActivity::class.java)
        startActivity(intent)

        Log.d("WatchApp", "Main going...")
        Toast.makeText(this, "Message: Main activity a go", Toast.LENGTH_SHORT).show()

        watchApp = MyWearListenerService()
    }

    override fun onDestroy() {
        super.onDestroy()
    }
//    override fun onCreate(savedInstanceState: Bundle?) {
//        super.onCreate(savedInstanceState)
//        setContentView(R.layout.activity_main)
//
//        val intent = Intent(this, SettingsActivity::class.java)
//        startActivity(intent)
//    }
//
    override fun onResume() {
        super.onResume()
    }

    override fun onPause() {
        super.onPause()
    }
}
