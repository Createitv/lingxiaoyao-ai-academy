use tauri_plugin_deep_link::DeepLinkExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_deep_link::init())
        .setup(|app| {
            // Register the deep link handler for lingxiaoyao:// scheme
            app.deep_link().on_open_url(|event| {
                let urls = event.urls();
                for url in urls {
                    // lingxiaoyao://auth?code=xxx
                    if url.scheme() == "lingxiaoyao" && url.host_str() == Some("auth") {
                        let code = url
                            .query_pairs()
                            .find(|(k, _)| k == "code")
                            .map(|(_, v)| v.to_string());

                        if let Some(code) = code {
                            // Emit event to frontend with the auth code
                            println!("[Deep Link] WeChat auth code received: {}", &code[..8]);
                            // The frontend listens for this event via Tauri's event system
                            // app.emit("wechat-auth-code", code); // handled in frontend
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
