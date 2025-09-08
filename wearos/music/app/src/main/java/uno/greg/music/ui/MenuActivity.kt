package uno.greg.music.ui

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import androidx.wear.widget.WearableLinearLayoutManager
import uno.greg.music.R
import uno.greg.music.common.CustomScrollingLayoutCallback
import uno.greg.music.databinding.ActivityFilesBinding
import uno.greg.music.model.ActionType
import uno.greg.music.ui.action.ActionDeleteActivity
import uno.greg.music.ui.action.ActionNewFolderActivity
import uno.greg.music.ui.action.ActionRenameActivity
import uno.greg.music.ui.adapter.MenuAdapter
import uno.greg.music.viewmodel.FileViewModel
import java.io.File

class MenuActivity : AppCompatActivity() {
    private lateinit var viewModel: FileViewModel
    private lateinit var adapter: MenuAdapter
    private lateinit var binding: ActivityFilesBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setTheme(R.style.TealTheme)

        binding = ActivityFilesBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.recyclerView.layoutManager = WearableLinearLayoutManager(this, CustomScrollingLayoutCallback())
       // binding.recyclerView.addItemDecoration(SpacingItemDecoration(R.dimen.spacing, this))
        binding.recyclerView.requestFocus()

        val path = intent.getStringExtra("path")
        if (path.isNullOrEmpty()){finish()}
        val file = File(path!!)
        adapter = MenuAdapter(
            file,
            onActionClick = { action ->
                when (action.type){
                    ActionType.OPEN -> TODO()
                    ActionType.RENAME -> {
                        val intent = Intent(this, ActionRenameActivity::class.java)
                        intent.putExtra("path", path)
                        startActivity(intent)
                    }
                    ActionType.DELETE -> {
                        val intent = Intent(this, ActionDeleteActivity::class.java)
                        intent.putExtra("path", path)
                        startActivity(intent)
                    }
                    ActionType.COPY -> {
                        viewModel.copyFile(path)
                        finish()
                    }
                    ActionType.PASTE -> {
                        viewModel.pasteFile(path)
                        finish()
                    }
                    ActionType.NEW_FOLDER -> {
                        val intent = Intent(this, ActionNewFolderActivity::class.java)
                        intent.putExtra("path", path)
                        startActivity(intent)
                    }
                    ActionType.CUT -> {
                        viewModel.cutFile(path)
                        finish()
                    }
                }
            },
            onFooterClick = {
                finish()
            }
        )

        binding.recyclerView.adapter = adapter


        viewModel = ViewModelProvider(this).get(FileViewModel::class.java)
        val actions = path.let { viewModel.getAvailableActions(it) }
        adapter.updateActions(actions, file)

    }

}
