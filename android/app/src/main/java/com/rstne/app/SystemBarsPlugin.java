package com.rstne.app;

import android.graphics.Color;
import android.view.Window;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Edge-to-edge friendly replacement for @capacitor/status-bar on Android.
 * Avoids Window#setStatusBarColor / getStatusBarColor (deprecated in Android 15):
 * icon contrast goes through WindowInsetsControllerCompat, and the colour seen
 * behind the (transparent) system bars is the decor view background.
 */
@CapacitorPlugin(name = "SystemBars")
public class SystemBarsPlugin extends Plugin {

    /** style "dark" = light icons (for dark backgrounds), "light" = dark icons. */
    @PluginMethod
    public void setStyle(PluginCall call) {
        final String style = call.getString("style", "light");
        getActivity().runOnUiThread(() -> {
            Window window = getActivity().getWindow();
            WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, window.getDecorView());
            boolean lightIcons = "dark".equalsIgnoreCase(style);
            controller.setAppearanceLightStatusBars(!lightIcons);
            controller.setAppearanceLightNavigationBars(!lightIcons);
            call.resolve();
        });
    }

    @PluginMethod
    public void setBackgroundColor(PluginCall call) {
        final String color = call.getString("color");
        if (color == null) {
            call.reject("color is required");
            return;
        }
        final int parsed;
        try {
            parsed = Color.parseColor(color);
        } catch (IllegalArgumentException e) {
            call.reject("Invalid color: " + color);
            return;
        }
        getActivity().runOnUiThread(() -> {
            getActivity().getWindow().getDecorView().setBackgroundColor(parsed);
            call.resolve(new JSObject());
        });
    }
}
