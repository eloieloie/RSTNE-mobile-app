# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# --- RSTNE release (R8) rules ---
# Keep stack traces readable in Play Console / Crashlytics (mapping.txt is uploaded with the AAB).
-keepattributes SourceFile,LineNumberTable,*Annotation*,Signature,InnerClasses,EnclosingMethod
-renamesourcefileattribute SourceFile

# Methods exposed to the WebView via addJavascriptInterface must keep their names.
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# App-local Capacitor plugins (Capacitor's own consumer rules cover library plugins).
-keep class com.rstne.app.** extends com.getcapacitor.Plugin { *; }

# @capacitor-firebase/authentication references optional providers we don't ship
# (only apple.com and google.com are enabled in capacitor.config.ts).
-dontwarn com.facebook.**
