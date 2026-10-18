package com.rstne.app;

import android.content.res.Configuration;
import android.graphics.Color;
import android.view.View;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Sets the colour visible behind the (transparent) status and navigation bars.
 *
 * Capacitor 8's core SystemBars plugin handles insets and icon contrast, but always
 * paints the decor view with the theme's windowBackground. This plugin overrides that
 * with the reading theme's colour, without Window#setStatusBarColor (deprecated in Android 15).
 */
@CapacitorPlugin(name = "SystemBarColor")
public class SystemBarColorPlugin extends Plugin {

    private Integer color;

    @PluginMethod
    public void setBackgroundColor(PluginCall call) {
        final String value = call.getString("color");
        if (value == null) {
            call.reject("color is required");
            return;
        }
        try {
            color = Color.parseColor(value);
        } catch (IllegalArgumentException e) {
            call.reject("Invalid color: " + value);
            return;
        }
        getActivity().runOnUiThread(() -> {
            apply();
            call.resolve();
        });
    }

    @Override
    protected void handleOnConfigurationChanged(Configuration newConfig) {
        super.handleOnConfigurationChanged(newConfig);
        // SystemBars repaints the decor view on configuration changes; re-apply ours afterwards.
        getActivity().getWindow().getDecorView().post(this::apply);
    }

    private void apply() {
        if (color == null) return;
        View decor = getActivity().getWindow().getDecorView();
        decor.setBackgroundColor(color);
    }
}
