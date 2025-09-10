package uno.greg.music.ui

import android.content.ActivityNotFoundException
import android.content.Intent
import android.os.Bundle
import android.os.Environment
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.FileProvider
import androidx.lifecycle.ViewModelProvider
import androidx.wear.widget.WearableLinearLayoutManager
import uno.greg.music.PermissionManager
import uno.greg.music.R
import uno.greg.music.common.CustomScrollingLayoutCallback
import uno.greg.music.databinding.ActivityFilesBinding
import uno.greg.music.ui.adapter.FileAdapter
import uno.greg.music.viewmodel.FileViewModel
import java.io.File

class FileActivity : AppCompatActivity() {
    private lateinit var viewModel: FileViewModel
    private lateinit var adapter: FileAdapter
    private lateinit var binding: ActivityFilesBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setTheme(R.style.TealTheme)

        binding = ActivityFilesBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.recyclerView.layoutManager = WearableLinearLayoutManager(this, CustomScrollingLayoutCallback())

        val permissionManager = PermissionManager()
        val isGranted = permissionManager.checkFilesPermissions(this)

        if (!isGranted) {
            binding.recyclerView.visibility = View.GONE
            binding.permissionAlert.visibility = View.VISIBLE
            binding.permissionAlert.requestFocus()
            binding.tryGetPermissions.setOnClickListener {
                permissionManager.requestFilesPermissions(this)
            }
        } else {
            binding.recyclerView.visibility = View.VISIBLE
            binding.recyclerView.requestFocus()
            binding.permissionAlert.visibility = View.GONE
        }

        viewModel = ViewModelProvider(this).get(FileViewModel::class.java)

        adapter = FileAdapter(
            currentPath = viewModel.currentPath.value ?: "",
            onFileClick = { file -> onFileClicked(file) },
            onFooterClick = { path -> onMoreClicked(path) },
            onBackClick = { finish() },
            onSettingsClick = { onSettingsClicked() },
            isBackEnabled = viewModel.currentPath.value != Environment.getExternalStorageDirectory().path
        )

        binding.recyclerView.adapter = adapter
        adapter.setLoading()

        viewModel.files.observe(this) { files ->
            adapter.updateFiles(files)
        }
    }

    override fun onResume() {
        super.onResume()

        val currentPath = viewModel.currentPath.value ?: Environment.getExternalStorageDirectory().path
        if (!viewModel.isExists(currentPath)) {
            finish()
        }
        viewModel.loadFiles(currentPath)
    }

    private fun onSettingsClicked(){
        val intent = Intent(this, SettingsActivity::class.java)
        startActivity(intent)
    }


    private fun onFileClicked(file: File) {
        if (file.isDirectory) {
            val intent = Intent(this, FileActivity::class.java)
            intent.putExtra("path", file.absolutePath)
            startActivity(intent)
        } else {
            val intent = Intent(Intent.ACTION_VIEW)
            val uri = FileProvider.getUriForFile(this, "${packageName}.provider", file)
            val mimeType = contentResolver.getType(uri) ?: "*/*"

            intent.setDataAndType(uri, mimeType)
            intent.flags = Intent.FLAG_GRANT_READ_URI_PERMISSION

            try {
                startActivity(intent)
            } catch (e: ActivityNotFoundException) {
                Toast.makeText(this, getString(R.string.no_program_to_open), Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun onMoreClicked(path: String) {
        val intent = Intent(this, MenuActivity::class.java)
        intent.putExtra("path", path)
        startActivity(intent)
    }
}
