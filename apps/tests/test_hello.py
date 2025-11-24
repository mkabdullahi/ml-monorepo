"""Hello unit test module."""

from cv_app.hello import hello


def test_hello():
    """Test the hello function."""
    assert hello() == "Hello cv-app"
