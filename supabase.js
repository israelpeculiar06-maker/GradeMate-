const SUPABASE_URL = "https://urvwolpfuhwtpigcrdhn.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Itoc70K6ZR81D_GYEmrdNg_IL3e3Voq";

var supabaseClient = null;

(function () {
    const sources = [
        "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js",
        "https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.js",
        "https://fastly.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"
    ];

    function init() {
        if (!supabaseClient && window.supabase && window.supabase.createClient) {
            supabaseClient = window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_ANON_KEY
            );
        }
        return !!supabaseClient;
    }

    function load(index) {
        if (init()) return;

        if (index >= sources.length) {
            console.error("Supabase library could not be loaded from any source.");
            return;
        }

        const script = document.createElement("script");
        script.src = sources[index];
        script.onload = function () {
            if (!init()) load(index + 1);
        };
        script.onerror = function () {
            load(index + 1);
        };
        document.head.appendChild(script);
    }

    load(0);
})();