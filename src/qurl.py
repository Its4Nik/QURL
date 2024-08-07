from flask import Flask

# File imports:
import routes

app = Flask(__name__)

app.add_url_rule('/', 'index', routes.index)
app.add_url_rule('/create', 'create_link', routes.create_link, methods=['POST'])
app.add_url_rule('/s/<slug>', 'redirect_link', routes.redirect_link)
app.add_url_rule('/edit/<slug>', 'edit_link', routes.edit_link, methods=['POST'])
app.add_url_rule('/qr-code/<slug>', 'qr_code', routes.qr_code)
app.add_url_rule('/delete/<slug>', 'delete_link', routes.delete, methods=['POST'])

if __name__ == '__main__':
    app.run()
