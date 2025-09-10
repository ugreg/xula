package uno.greg.music.ui.action

import android.content.ActivityNotFoundException
import android.content.Intent
import android.os.Bundle
import android.os.Environment
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.FileProvider
import androidx.core.os.bundleOf
import androidx.core.widget.doOnTextChanged
import androidx.lifecycle.SavedStateViewModelFactory
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
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

class ActionRenameActivity : AppCompatActivity() {
    private lateinit var binding: ActivityActionRenameBinding
    private lateinit var viewModel: FileViewModel
    private lateinit var path: String

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityActionRenameBinding.inflate(layoutInflater)
        setContentView(binding.root)

        if  (intent.getStringExtra("path") == null){
            finish()
        }else{
            path = intent.getStringExtra("path")!!
        }

        val file = File(path)
        if (!file.exists()) {
            finish()
        }

        binding.cancel.setOnClickListener {
            finish()
        }

        viewModel = ViewModelProvider(this).get(FileViewModel::class.java)

        binding.newName.editText?.setText(file.name)

        binding.newName.editText?.doOnTextChanged { text, start, before, count ->
            binding.done.isEnabled = text.toString().isNotEmpty()
        }

        binding.done.setOnClickListener {
            viewModel.renameFileOrFolder(path, binding.newName.editText?.text.toString())
            finish()
        }



    }

}
