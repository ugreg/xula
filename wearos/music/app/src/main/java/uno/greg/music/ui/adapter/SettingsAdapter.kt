package uno.greg.music.ui.adapter

import android.content.Intent
import android.net.Uri
import android.provider.Settings
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
import uno.greg.music.ui.SettingsActivity
import java.util.concurrent.Executors
import androidx.wear.compose.material.Button
import androidx.wear.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.core.content.ContextCompat

class SettingsAdapter(
    private val activity: SettingsActivity,
    private val items: List<SettingsItem>
) : RecyclerView.Adapter<RecyclerView.ViewHolder>() {

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
                Toast.makeText(activity.baseContext, "Hello World from Compose!", Toast.LENGTH_SHORT).show()
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