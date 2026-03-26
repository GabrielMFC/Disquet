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
                val outputDir = reactApplicationContext.filesDir.absolutePath + "/disquet/"
                val file = java.io.File(outputDir)
                if (!file.exists()) file.mkdirs()

                val request = YoutubeDLRequest(url)
                request.addOption("--no-playlist")
                request.addOption("--extractor-args", "youtube:player_client=android,ios,web")
                request.addOption("--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36")
                request.addOption("-f", "140/bestaudio/best")
                request.addOption("-x")
                request.addOption("--audio-format", "mp3")
                request.addOption("--postprocessor-args", "ffmpeg:-af loudnorm=I=-14:TP=-1.5:LRA=11")
                request.addOption("--audio-quality", "0")
                request.addOption("-o", "$outputDir%(title)s.%(ext)s")

                YoutubeDL.getInstance().execute(request) { progress, eta, line ->
                    android.util.Log.d("YtDlp", "$progress%")
                }

                val downloadedFile = file.listFiles()?.maxByOrNull { it.lastModified() }

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