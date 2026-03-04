use tauri::Emitter;
use tauri_plugin_deep_link::DeepLinkExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_process::init())
        .setup(|app| {
            let handle = app.handle().clone();

            // Register updater plugin with custom target for universal macOS binary
            #[cfg(desktop)]
            {
                let mut updater_builder = tauri_plugin_updater::Builder::new();
                #[cfg(target_os = "macos")]
                {
                    updater_builder = updater_builder.target("darwin-universal");
                }
                app.handle().plugin(updater_builder.build())?;
            }

            // Register the deep link handler for lingxiaoyao:// scheme
            app.deep_link().on_open_url(move |event| {
                let urls = event.urls();
                for url in urls {
                    // lingxiaoyao://auth?code=xxx
                    if url.scheme() == "lingxiaoyao" && url.host_str() == Some("auth") {
                        let code = url
                            .query_pairs()
                            .find(|(k, _)| k == "code")
                            .map(|(_, v)| v.to_string());

                        if let Some(code) = code {
                            println!("[Deep Link] WeChat auth code received");
                            // Emit event to frontend with the auth code
                            let _ = handle.emit("wechat-auth-code", code);
                        }
                    }
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
