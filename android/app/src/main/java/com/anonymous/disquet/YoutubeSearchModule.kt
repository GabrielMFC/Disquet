package com.anonymous.disquet

import com.facebook.react.bridge.*
import com.yausername.youtubedl_android.YoutubeDL
import com.yausername.youtubedl_android.YoutubeDLRequest
import org.json.JSONObject

class YoutubeSearchModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "YoutubeSearch"

    @ReactMethod
    fun search(query: String, limit: Int, promise: Promise) {
        Thread {
            try {
                val request = YoutubeDLRequest("ytsearch$limit:$query").apply {
                    addOption("--flat-playlist")
                    addOption("--dump-json")
                    addOption("--quiet")
                }

                val output = YoutubeDL.getInstance().execute(request)

                val results = Arguments.createArray()

                output.out.split("\n").forEach { line ->
                    if (line.isNotBlank()) {
                        val json = JSONObject(line)

                        val obj = Arguments.createMap()
                        obj.putString("title", json.optString("title"))
                        obj.putString("url", "https://www.youtube.com/watch?v=${json.optString("id")}")

                        results.pushMap(obj)
                    }
                }

                promise.resolve(results)

            } catch (e: Exception) {
                promise.reject("ERROR", e.message)
            }
        }.start()
    }
}