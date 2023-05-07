module.exports = {
    root: true,
    env: {
        jest: true,
        node: true,
    },
    plugins: ["prettier"],
    extends: ["eslint:recommended", "plugin:prettier/recommended"],
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
    },
    rules: {
        "prettier/prettier": [
            "error",
            {
                endOfLine: "auto",
                tabWidth: 4,
            },
        ],
    },
};
