
package com.anonymous.disquet

import android.content.Intent
import android.os.Environment
import android.provider.Settings
import android.net.Uri
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File

class StorageModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "StorageModule"

    private val dir: File
        get() = File(Environment.getExternalStorageDirectory(), FOLDER_NAME)

    @ReactMethod
    fun getFiles(promise: Promise) {
        try {
            Log.d(TAG, "getFiles: diretório = ${dir.absolutePath}")

            if (!dir.exists() || !dir.isDirectory) {
                Log.e(TAG, "Pasta Disquet não encontrada: ${dir.absolutePath}")
                promise.reject("ERROR", "Pasta Disquet não encontrada")
                return
            }

            val uris = Arguments.createArray()

            dir.listFiles()?.forEach { file ->
                if (file.isFile) {
                    Log.d(TAG, "Arquivo encontrado: ${file.absolutePath}")
                    uris.pushString(file.absolutePath)
                }
            }

            promise.resolve(uris)

        } catch (e: Exception) {
            Log.e(TAG, "Erro ao listar arquivos", e)
            promise.reject("ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun getDirs(promise: Promise) {
        try {
            if (!dir.exists() || !dir.isDirectory) {
                promise.reject("ERROR", "Pasta Disquet não encontrada")
                return
            }

            val array = Arguments.createArray()

            dir.listFiles()
                ?.filter { it.isDirectory }
                ?.forEach { file ->
                    array.pushString(file.absolutePath)
                }

            promise.resolve(array)

        } catch (e: Exception) {
            Log.e(TAG, "Erro ao listar diretórios", e)
            promise.reject("ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun deleteFile(filePath: String, promise: Promise) {
        try {
            val originalFile = File(filePath)
            val file = originalFile.canonicalFile
            val baseDir = dir.canonicalFile

            if (!file.path.startsWith(baseDir.path + File.separator)) {
                promise.reject("INVALID_PATH", "Arquivo fora da pasta Disquet.")
                return
            }

            if (!file.exists()) {
                promise.reject("NOT_FOUND", "Arquivo não encontrado.")
                return
            }

            if (!file.isFile) {
                promise.reject("INVALID_FILE", "O caminho informado não é um arquivo.")
                return
            }

            if (file.delete()) {
                promise.resolve(true)
            } else {
                promise.reject("DELETE_ERROR", "Não foi possível excluir o arquivo.")
            }

        } catch (e: Exception) {
            promise.reject("ERROR", e.message, e)
        }
    }
    @ReactMethod
    fun openManagePermissionSettings(promise: Promise) {
        try {
            val intent = Intent(
                Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION
            )

            intent.data = Uri.parse(
                "package:${reactApplicationContext.packageName}"
            )

            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK

            reactApplicationContext.startActivity(intent)
            promise.resolve(true)

        } catch (e: Exception) {
            Log.e(TAG, "Erro ao abrir configurações de permissão", e)
            promise.reject("ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun checkManagePermission(promise: Promise) {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.R) {
            promise.resolve(Environment.isExternalStorageManager())
        } else {
            promise.resolve(true)
        }
    }

    @ReactMethod
    fun getOrCreate(folderName: String?, promise: Promise) {
        try {
            val base = dir

            val target = if (folderName.isNullOrBlank()) {
                base
            } else {
                File(base, folderName).canonicalFile
            }

            if (
                target != base.canonicalFile &&
                !target.path.startsWith(base.canonicalPath + File.separator)
            ) {
                promise.reject("INVALID_PATH", "Nome de pasta inválido.")
                return
            }

            if (target.exists() || target.mkdirs()) {
                promise.resolve(target.absolutePath)
            } else {
                promise.reject(
                    "ERROR",
                    "Falha ao criar ${target.absolutePath}."
                )
            }

        } catch (e: Exception) {
            Log.e(TAG, "Erro ao criar diretório", e)
            promise.reject("ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun exists(promise: Promise) {
        promise.resolve(dir.exists() && dir.isDirectory)
    }

    @ReactMethod
    fun getPath(promise: Promise) {
        if (dir.exists() && dir.isDirectory) {
            promise.resolve(dir.absolutePath)
        } else {
            promise.resolve(null)
        }
    }

    companion object {
        private const val FOLDER_NAME = "Disquet"
        private const val TAG = "DisquetStorage"
    }
}
