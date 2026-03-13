package com.anonymous.disquet

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.yausername.youtubedl_android.YoutubeDL
import com.yausername.youtubedl_android.YoutubeDLRequest

class YtDlpModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "YtDlp"

@ReactMethod
    fun download(url: String, promise: Promise) {
        Thread {
            try {
                android.util.Log.d("YtDlp", "iniciando update...")
                YoutubeDL.getInstance().updateYoutubeDL(reactApplicationContext, YoutubeDL.UpdateChannel.STABLE)
                android.util.Log.d("YtDlp", "update ok, iniciando download...")
                
                val outputDir = reactApplicationContext.filesDir.absolutePath + "/disquet/"
                val file = java.io.File(outputDir)
                if (!file.exists()) file.mkdirs()

                val request = YoutubeDLRequest(url)
                request.addOption("-x")
                request.addOption("--audio-format", "mp3")
                request.addOption("--audio-quality", "0")
                request.addOption("-o", "$outputDir%(title)s.%(ext)s")

                val response = YoutubeDL.getInstance().execute(request) { progress, eta, line ->
                    android.util.Log.d("YtDlp", "$progress%")
                }

                // Pega o arquivo mais recente da pasta
                val downloadedFile = file.listFiles()
                    ?.maxByOrNull { it.lastModified() }

                if (downloadedFile != null) {
                    promise.resolve(downloadedFile.absolutePath)
                } else {
                    promise.reject("ERROR", "Arquivo não encontrado após download")
                }
            } catch (e: Exception) {
                android.util.Log.e("YtDlp", "erro: ${e.message}")
                promise.reject("ERROR", e.message)
            }
        }.start()
    }
}