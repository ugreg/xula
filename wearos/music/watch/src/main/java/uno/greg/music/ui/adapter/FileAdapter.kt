package uno.greg.music.ui.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.webkit.MimeTypeMap
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import uno.greg.music.R
import uno.greg.music.common.Utils
import java.io.File

class FileAdapter(
    private var currentPath: String = "",
    private var files: List<File> = emptyList(),
    private val onFileClick: (File) -> Unit,
    private val onFooterClick: (String) -> Unit,
    private val onBackClick: () -> Unit,
    private val onSettingsClick: () -> Unit,
    private val isBackEnabled: Boolean = false,
) : RecyclerView.Adapter<RecyclerView.ViewHolder>() {

    private var isLoading: Boolean = false

    companion object {
        private const val VIEW_TYPE_FILE = 0
        private const val VIEW_TYPE_FOOTER = 1
        private const val VIEW_TYPE_HEADER = 2
        private const val VIEW_TYPE_PLACEHOLDER = 3
    }

    override fun getItemViewType(position: Int): Int {
        return when (position) {
            0 -> VIEW_TYPE_HEADER
            in 1..(if (isLoading) 6 else files.size) -> {
                if (isLoading) VIEW_TYPE_PLACEHOLDER else VIEW_TYPE_FILE
            }
            else -> VIEW_TYPE_FOOTER
        }
    }


    fun setLoading() {
        isLoading = true
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        return when (viewType) {
            VIEW_TYPE_FILE -> {
                val view = LayoutInflater.from(parent.context)
                    .inflate(R.layout.file_item, parent, false)
                FileViewHolder(view)
            }
            VIEW_TYPE_FOOTER -> {
                val view = LayoutInflater.from(parent.context)
                    .inflate(R.layout.more_button, parent, false)
                FooterViewHolder(view)
            }
            VIEW_TYPE_HEADER -> {
                val view = LayoutInflater.from(parent.context)
                    .inflate(R.layout.path_view, parent, false)
                HeaderViewHolder(view)
            }
            VIEW_TYPE_PLACEHOLDER -> {
                val view = LayoutInflater.from(parent.context)
                    .inflate(R.layout.file_item, parent, false)
                PlaceholderViewHolder(view)
            }

            else -> throw IllegalArgumentException("Unknown view type: $viewType")
        }
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        when (holder) {
            is FileViewHolder -> {
                val file = files[position - 1]
                holder.bind(file, onFileClick, onFooterClick)
            }
            is FooterViewHolder -> {
                holder.bind(onFooterClick, onBackClick, onSettingsClick, isBackEnabled, currentPath)
            }
            is HeaderViewHolder -> {
                holder.bind(currentPath)
            }

        }
    }

    override fun getItemCount(): Int {
        return if (isLoading) {
            1 + 6 + 1
        } else {
            1 + files.size + 1
        }
    }

    fun updateFiles(newFiles: List<File>, newPath: String = currentPath) {
        isLoading = false
        files = newFiles
        currentPath = newPath
        notifyDataSetChanged()
    }

    class FileViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val name: TextView = itemView.findViewById(R.id.item_name)
        private val icon: ImageView = itemView.findViewById(R.id.item_icon)

        fun bind(file: File, onFileClick: (File) -> Unit, onFooterClick: (String) -> Unit) {
            name.text = file.name
            itemView.setOnClickListener { onFileClick(file) }
            itemView.setOnLongClickListener {
                onFooterClick(file.absolutePath)
                true
            }
            if (file.isDirectory) {
                icon.setImageResource(R.drawable.folder)
            } else {
                icon.setImageResource(Utils.getFileIconResId(file))
            }
        }
    }

    class PlaceholderViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView)


    class FooterViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val button_more: Button = itemView.findViewById(R.id.more_button)
        private val button_back: Button = itemView.findViewById(R.id.back_button)
        private val button_settings: Button = itemView.findViewById(R.id.settings_button)

        fun bind(
            onFooterClick: (path: String) -> Unit,
            onBackClick: () -> Unit,
            onSettingsClick: () -> Unit,
            isBackEnabled: Boolean,
            currentPath: String
        ) {
            if (isBackEnabled){
                button_back.visibility = View.VISIBLE
                button_settings.visibility = View.GONE
            } else {
                button_back.visibility = View.GONE
                button_settings.visibility = View.VISIBLE
            }
            button_more.setOnClickListener { onFooterClick(currentPath) }
            button_back.setOnClickListener { onBackClick() }
            button_settings.setOnClickListener { onSettingsClick() }
        }
    }

    class HeaderViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val pathText: TextView = itemView.findViewById(R.id.path)

        fun bind(currentPath: String) {
            pathText.text = currentPath
        }
    }
}