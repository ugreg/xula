package uno.greg.music.ui

import android.content.Intent
import android.os.Bundle
import android.os.Environment
import androidx.activity.ComponentActivity
import uno.greg.music.R

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val intent = Intent(this, FileActivity::class.java)
        intent.putExtra("path", Environment.getExternalStorageDirectory().path)
        startActivity(intent)
    }
}