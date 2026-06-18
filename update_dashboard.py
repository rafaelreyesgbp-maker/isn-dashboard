name: Actualizar Dashboard ISN

on:
  schedule:
    - cron: '0 13 * * 1-5'
  workflow_dispatch:

jobs:
  actualizar:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install requests xlrd
      - run: python update_dashboard.py
      - uses: EndBug/add-and-commit@v9
        with:
          message: 'Auto-update: datos ISN'
          default_author: github_actions
          add: 'isn_dashboard_live.html'
      - name: Deploy a Netlify
        run: npx netlify-cli@latest deploy --prod --dir . --site ${{ secrets.NETLIFY_SITE_ID }} --auth ${{ secrets.NETLIFY_AUTH_TOKEN }}
