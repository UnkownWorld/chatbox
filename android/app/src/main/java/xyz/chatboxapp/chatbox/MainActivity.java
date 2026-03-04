package xyz.chatboxapp.chatbox;

import android.os.Bundle;
import android.util.Log;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    
    private static final String TAG = "Chatbox";
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        Log.d(TAG, "MainActivity onCreate started");
        
        // 注册所有 Capacitor 插件
        registerPlugin(com.capacitorjs.plugins.app.AppPlugin.class);
        registerPlugin(com.capacitorjs.plugins.browser.BrowserPlugin.class);
        registerPlugin(com.capacitorjs.plugins.device.DevicePlugin.class);
        registerPlugin(com.capacitorjs.plugins.filesystem.FilesystemPlugin.class);
        registerPlugin(com.capacitorjs.plugins.keyboard.KeyboardPlugin.class);
        registerPlugin(com.capacitorjs.plugins.share.SharePlugin.class);
        registerPlugin(com.capacitorjs.plugins.splashscreen.SplashScreenPlugin.class);
        registerPlugin(com.capacitorjs.plugins.toast.ToastPlugin.class);
        registerPlugin(com.capacitor.community.sqlite.SQLitePlugin.class);
        
        super.onCreate(savedInstanceState);
        
        Log.d(TAG, "MainActivity onCreate completed");
    }
    
    @Override
    public void onStart() {
        super.onStart();
        Log.d(TAG, "MainActivity onStart");
    }
    
    @Override
    public void onResume() {
        super.onResume();
        Log.d(TAG, "MainActivity onResume");
    }
    
    @Override
    public void onPageLoaded(WebView webView) {
        super.onPageLoaded(webView);
        Log.d(TAG, "Page loaded successfully");
    }
    
    @Override
    public void onPageError(WebView webView, int errorCode, String description, String failingUrl) {
        super.onPageError(webView, errorCode, description, failingUrl);
        Log.e(TAG, "Page load error: " + description + " (code: " + errorCode + ", url: " + failingUrl + ")");
    }
}
