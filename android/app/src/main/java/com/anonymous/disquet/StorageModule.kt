package com.anonymous.disquet
import android.content.Intent
import android.os.Environment
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import java.io.File

class StorageModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "StorageModule"

    private val dir: File
        get() = File(Environment.getExternalStorageDirectory(), FOLDER_NAME)

    @ReactMethod
    fun getFiles(promise: Promise) {
        if (!dir.exists() || !dir.isDirectory) {
            promise.reject("ERROR", "Pasta Disquet não encontrada")
            return
        }

        val uris = com.facebook.react.bridge.Arguments.createArray()
        dir.listFiles()?.forEach { file ->
            if (file.isFile) uris.pushString(file.absolutePath)
        }

        promise.resolve(uris)
    }

    @ReactMethod
    fun openManagePermissionSettings(promise: Promise) {
        try {
            val intent = Intent(android.provider.Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION)
            intent.data = android.net.Uri.parse("package:${reactApplicationContext.packageName}")
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            reactApplicationContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun checkManagePermission(promise: Promise) {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.R) {
            promise.resolve(android.os.Environment.isExternalStorageManager())
        } else {
            promise.resolve(true)
        }
    }

    @ReactMethod
    fun getOrCreate(promise: Promise) {
        val result = if (dir.exists() || dir.mkdirs()) dir else null
        if (result != null) promise.resolve(result.absolutePath)
        else promise.reject("ERROR", "Não foi possível criar a pasta Disquet")
    }

    @ReactMethod
    fun exists(promise: Promise) {
        promise.resolve(dir.exists() && dir.isDirectory)
    }

    @ReactMethod
    fun getPath(promise: Promise) {
        if (dir.exists() && dir.isDirectory) promise.resolve(dir.absolutePath)
        else promise.resolve(null)
    }

    companion object {
        private const val FOLDER_NAME = "Disquet"
    }
}