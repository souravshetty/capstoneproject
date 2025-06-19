git clone <YOUR_REPO_URL>
cd face-detection
npm install

⚠️ Before running on Android
You must create a local.properties file on your own machine: under android folder adda file named local.properties 

cd android
Create local.properties file:  and add the below path

sdk.dir=C:\\Users\\<YOUR_USERNAME>\\AppData\\Local\\Android\\Sdk
(Use your local Android SDK path)

Option A — Build Dev Client on your phone (needs Android Studio + Emulator or physical device):

npx expo run:android
This will:Build the Dev Client APK

Install it on your connected Android device

After this, you can use:
.npx expo start --dev-client --tunnel




or use the below commands  to geenarte the apk:

If you want to generate APK manually (for sharing):

cd android
./gradlew assembleDebug
APK will be in:android/app/build/outputs/apk/debug/app-debug.apk

to start the metrobundler  use this
.npx expo start --dev-client --tunnel
and copy the url and paste in the app and click on connect