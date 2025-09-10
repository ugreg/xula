package uno.greg.music.ui.adapter

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Environment
import android.provider.ContactsContract.CommonDataKinds.Website.URL
import android.provider.Settings
import android.util.Log
import android.view.LayoutInflater
import android.view.ViewGroup
import android.widget.Toast
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.getSystemService
import androidx.core.net.toUri
import androidx.core.view.isGone
import androidx.core.view.isVisible
import androidx.recyclerview.widget.RecyclerView
import androidx.wear.activity.ConfirmationActivity
import androidx.wear.remote.interactions.RemoteActivityHelper
import uno.greg.music.R
import uno.greg.music.databinding.ItemSettingsHeaderBinding
import uno.greg.music.databinding.MoreButtonBinding
import uno.greg.music.databinding.SettingsItemBinding
import uno.greg.music.model.SettingsItem
import uno.greg.music.model.SettingsItemType
import uno.greg.music.ui.action.ActionTransferActivity
import uno.greg.music.ui.SettingsActivity
import java.util.concurrent.Executors
import androidx.wear.compose.material.Button
import androidx.wear.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.concurrent.futures.await
import androidx.core.content.ContextCompat
import androidx.core.content.ContextCompat.startActivity
import com.google.android.gms.common.wrappers.Wrappers.packageManager
import androidx.appcompat.app.AppCompatActivity
import androidx.activity.ComponentActivity
import androidx.wear.widget.ConfirmationOverlay
import com.google.android.gms.wearable.DataClient
import com.google.android.gms.wearable.DataEvent
import com.google.android.gms.wearable.DataEventBuffer
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.Wearable
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.io.BufferedReader
import java.io.File
import java.io.FileOutputStream
import java.io.FileWriter
import java.io.InputStream
import java.io.InputStreamReader
import java.net.URL
import kotlin.io.path.exists
import androidx.lifecycle.lifecycleScope
import com.google.android.gms.tasks.Task
import com.google.android.gms.tasks.Tasks
import com.google.android.gms.wearable.DataItem
import com.google.android.gms.wearable.PutDataMapRequest
import com.google.android.gms.wearable.PutDataRequest
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import kotlin.concurrent.thread

class SettingsAdapter(
    private val activity: SettingsActivity,
    private val items: List<SettingsItem>
) : RecyclerView.Adapter<RecyclerView.ViewHolder>() {

    private lateinit var dataClient: DataClient
    private var count = 0

    companion object {
        private const val TYPE_HEADER = 0
        private const val TYPE_WEB = 1
        private const val TYPE_SETTINGS = 2
        private const val TYPE_TRANSFER = 3
        private const val TYPE_FOOTER = 4
    }

    override fun getItemViewType(position: Int): Int {
        return when (items[position].type) {
            SettingsItemType.HEADER -> TYPE_HEADER
            SettingsItemType.WEB -> TYPE_WEB
            SettingsItemType.SETTINGS -> TYPE_SETTINGS
            SettingsItemType.TRANSFER -> TYPE_TRANSFER
            SettingsItemType.FOOTER -> TYPE_FOOTER
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        val inflater = LayoutInflater.from(parent.context)

        return when (viewType) {
            TYPE_HEADER -> {
                val binding = ItemSettingsHeaderBinding.inflate(inflater, parent, false)
                HeaderViewHolder(binding)
            }
            TYPE_WEB -> {
                val binding = SettingsItemBinding.inflate(inflater, parent, false)
                WebViewHolder(binding)
            }
            TYPE_SETTINGS -> {
                val binding = SettingsItemBinding.inflate(inflater, parent, false)
                SettingsViewHolder(binding)
            }
            TYPE_TRANSFER -> {
                val binding = SettingsItemBinding.inflate(inflater, parent, false)
                TransferViewHolder(binding)
            }

            TYPE_FOOTER -> {
                val binding = MoreButtonBinding.inflate(inflater, parent, false)
                FooterViewHolder(binding)
            }
            else -> throw IllegalArgumentException("Unknown view type")
        }
    }

    override fun getItemCount(): Int = items.size

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        val item = items[position]
        when (holder) {
            is WebViewHolder -> holder.bind(item)
            is SettingsViewHolder -> holder.bind()
            is HeaderViewHolder -> holder.bind()
            is TransferViewHolder -> holder.bind()
            is FooterViewHolder -> holder.bind()
        }
    }

    inner class HeaderViewHolder(private val binding: ItemSettingsHeaderBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind() {
            val packageInfo = activity.packageManager.getPackageInfo(activity.packageName, 0)
            val versionName = packageInfo.versionName
            val versionCode = packageInfo.longVersionCode
            binding.version.text = "$versionName ($versionCode)"
        }
    }

    inner class WebViewHolder(private val binding: SettingsItemBinding) :
        RecyclerView.ViewHolder(binding.root) {
        fun bind(item: SettingsItem) {
            binding.itemIcon.setImageResource(R.drawable.github)
            binding.itemName.setText(R.string.github)
            binding.root.setOnClickListener {

                val remoteActivityHelper = RemoteActivityHelper(activity, Executors.newSingleThreadExecutor())
                val result = remoteActivityHelper.startRemoteActivity(
                    Intent(Intent.ACTION_VIEW)
                        .addCategory(Intent.CATEGORY_BROWSABLE)
                        .setData(
                            item.url?.toUri()
                        ),
                    null
                )
                activity.startActivity(
                    Intent(activity, ConfirmationActivity::class.java)
                        .putExtra(ConfirmationActivity.EXTRA_ANIMATION_TYPE, ConfirmationActivity.OPEN_ON_PHONE_ANIMATION))
            }
        }
    }

    inner class SettingsViewHolder(private val binding: SettingsItemBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind() {
            binding.itemName.setText(R.string.app_settings)
            binding.itemIcon.setImageResource(R.drawable.settings)
            binding.root.setOnClickListener {
                val intent = Intent(
                    Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                    Uri.fromParts("package", activity.packageName, null)
                )
                activity.startActivity(intent)
            }
        }
    }

    inner class TransferViewHolder(private val binding: SettingsItemBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind() {
            binding.itemName.setText(R.string.transfer)
            binding.itemIcon.setImageResource(R.drawable.music_icon)
            binding.root.setOnClickListener {
//                Toast.makeText(activity.baseContext, "Hello World from Compose!", Toast.LENGTH_SHORT).show()
                try {
                    val downloadsDir =
                        activity.baseContext.getExternalFilesDir("/storage/emulated/0/Download/Test")
                    val directory = File("/storage/emulated/0/Download/Test")
                    if (!directory.exists()) {
                        directory.mkdirs()
                    }
                    val file = File(directory, "test.txt")
                    val writer = FileWriter(file)
                    writer.write("Hello World")
                    writer.close()


                    val mpThree = File(directory, "song.mp3")
                    val destinationFileMusic = File(downloadsDir, "song.mp3")
                    var inputStream: InputStream? = null
                    var outputStream: FileOutputStream? = null
                    inputStream = activity.baseContext.resources.openRawResource(R.raw.shuffle)
                    outputStream = FileOutputStream(mpThree)
                    inputStream.copyTo(outputStream)



//                    val phoneAppPackageName = "uno.greg.androidmusic.MainActivity"
//                    val intent = activity.packageManager.getLaunchIntentForPackage(phoneAppPackageName)
////                    val driveIntent = Intent(Intent.ACTION_VIEW).apply {
////                        data = "https://drive.google.com".toUri()
////                        addCategory(Intent.CATEGORY_BROWSABLE)
////                    }
//                    val remoteActivityHelper = RemoteActivityHelper(activity, Executors.newSingleThreadExecutor())
//                    val result = remoteActivityHelper.startRemoteActivity(
//                        Intent(intent),
//                        null
//                    )
//                    activity.startActivity(
//                        Intent(activity, ConfirmationActivity::class.java)
//                            .putExtra(ConfirmationActivity.EXTRA_ANIMATION_TYPE, ConfirmationActivity.OPEN_ON_PHONE_ANIMATION))



                } catch (e: Exception) {
                    Toast.makeText(activity.baseContext, "Error: ${e.cause}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    inner class FooterViewHolder(private val binding: MoreButtonBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind() {
            binding.backButton.isVisible = true
            binding.settingsButton.isGone = true
            binding.moreButton.isGone = true
            binding.backButton.setOnClickListener {
                activity.finish()
            }
        }
    }
}