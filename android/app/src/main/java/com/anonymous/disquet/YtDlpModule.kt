package com.anonymous.disquet

import com.facebook.react.bridge.*
import com.yausername.youtubedl_android.YoutubeDL
import com.yausername.youtubedl_android.YoutubeDLRequest
import com.facebook.react.modules.core.DeviceEventManagerModule
import android.os.Environment
import java.io.File

class YtDlpModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "YtDlp"

    @ReactMethod
    fun addListener(eventName: String) {}

    @ReactMethod
    fun removeListeners(count: Int) {}

    private fun sendEvent(eventName: String, params: String) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    fun getStatus(line: String, progress: Float): String? {
        return when {
            progress >= 0 -> "Baixando áudio..."
            line.contains("Downloading webpage") || line.contains("Extracting") -> "Preparando download..."
            line.contains("ExtractAudio") -> "Extraindo áudio..."
            line.contains("ffmpeg") || line.contains("Post-process") -> "Convertendo áudio..."
            else -> null
        }
    }

    private fun executeDownload(
        request: YoutubeDLRequest,
        outputDir: String,
        lastStatusRef: MutableMap<String, String>
    ): String? {

        YoutubeDL.getInstance().execute(request) { progress, _, line ->

            if (progress >= 0) {
                sendEvent("downloadProgress", progress.toString())
            }

            val status = getStatus(line, progress)
            val lastStatus = lastStatusRef["status"] ?: ""

            if (status != null && status != lastStatus) {
                lastStatusRef["status"] = status
                sendEvent("downloadStatus", status)
            }
        }

        val dir = File(outputDir)
        return dir.listFiles()?.maxByOrNull { it.lastModified() }?.absolutePath
    }

    @ReactMethod
    fun download(url: String, promise: Promise) {
        Thread {
            try {
                val outputDir = Environment.getExternalStorageDirectory().absolutePath + "/Disquet/"
                val dir = File(outputDir)
                if (!dir.exists()) dir.mkdirs()

                val lastStatusRef = mutableMapOf("status" to "")

                sendEvent("downloadStatus", "Estabelecendo conexão...")

                val safeRequest = YoutubeDLRequest(url).apply {
                    addOption("--no-playlist")
                    addOption("--extractor-args", "youtube:player_client=android,web")
                    addOption("--user-agent", "Mozilla/5.0")
                    addOption("-f", "140/bestaudio/best")
                    addOption("-x")
                    addOption("--audio-format", "m4a")
                    addOption("-o", "$outputDir%(title)s.%(ext)s")
                }

                val filePath = executeDownload(safeRequest, outputDir, lastStatusRef)

                if (filePath != null) {
                    sendEvent("downloadComplete", filePath)
                    promise.resolve(filePath)
                } else {
                    promise.reject("ERROR", "Arquivo não encontrado")
                }
            } catch (e: Exception) {
                android.util.Log.e("YtDlp", "erro: ${e.message}")
                promise.reject("ERROR", e.message)
            }
        }.start()
    }
}