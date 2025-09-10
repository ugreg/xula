package uno.greg.music.ui.action

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.os.Environment
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.FileProvider
import androidx.core.net.toUri
import androidx.core.os.bundleOf
import androidx.core.widget.doOnTextChanged
import androidx.lifecycle.SavedStateViewModelFactory
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import androidx.wear.remote.interactions.RemoteActivityHelper
import com.google.android.gms.wearable.Wearable
import kotlinx.coroutines.launch
import uno.greg.music.R
import uno.greg.music.databinding.ActivityActionDeleteBinding
import uno.greg.music.databinding.ActivityActionNewFolderBinding
import uno.greg.music.databinding.ActivityActionRenameBinding
import uno.greg.music.model.Action
import uno.greg.music.model.ActionType
import uno.greg.music.ui.adapter.FileAdapter
import uno.greg.music.ui.adapter.MenuAdapter
import uno.greg.music.viewmodel.FileViewModel
import java.io.File
import java.util.concurrent.Executors

class ActionTransferActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        lifecycleScope.launch {
            try {
                val result = openPlayStoreOnDevice(this@ActionTransferActivity)
            } catch (e: Exception) {
                Toast.makeText(this.coroutineContext as Context, "Error: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    suspend fun openPlayStoreOnDevice(context: Context) {
        val executor = Executors.newSingleThreadExecutor()
        val remoteActivityHelper = RemoteActivityHelper(context, executor)
        val result = remoteActivityHelper.startRemoteActivity(
            Intent(Intent.ACTION_VIEW)
                .setData(
                    "androidapp://uno.greg.androidmusic".toUri())
                .addCategory(Intent.CATEGORY_BROWSABLE),
            "")

//        while (!Wearable.getNodeClient(context).connectedNodes.isComplete) { }
//        val nodes = Wearable.getNodeClient(context).connectedNodes.result
//
//        for (node in nodes) {
//            val playStoreIntent = Intent(Intent.ACTION_VIEW)
//                .addCategory(Intent.CATEGORY_BROWSABLE)
//                .setData(Uri.parse("androidapp://uno.greg.androidmusic"))
//
//            remoteActivityHelper.startRemoteActivity(playStoreIntent, node.id)
//        }
    }
}
