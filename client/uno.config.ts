import { defineConfig, presetAttributify, presetUno } from 'unocss';

export default defineConfig({
    presets: [presetUno(), presetAttributify()],
    shortcuts: {
        'bg-y-text-b': 'bg-[#FFC333] text-[#0F0B0B]',
        'bg-b-text-w': 'bg-[#0F0B0B] text-[#FDFDFD]',
    },
});
