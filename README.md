# 3games-proxy

# User registration / deposit demo website

## Setup

```bash
# Install Python dependencies (use --break-system-packages on Debian-based distros with PEP 668)
pip install --break-system-packages -r requirements.txt

# Apply database migrations
python3 manage.py migrate

# (Optional) create admin user for Django admin panel
python3 manage.py createsuperuser

# Run development server
python3 manage.py runserver 0.0.0.0:8000
```

Then visit `http://localhost:8000` for the site, or `http://localhost:8000/admin` for the admin panel.