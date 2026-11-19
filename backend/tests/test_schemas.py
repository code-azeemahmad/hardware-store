import pytest
from pydantic import ValidationError

from app.schemas.enquiry import EnquiryCreate
from app.schemas.category import CategoryBase
from app.schemas.product import ProductBase


def test_valid_enquiry_create():
    enquiry = EnquiryCreate(
        name="Test Customer",
        phone="0300-1234567",
        email="customer@example.com",
        message="I would like to inquire about marine plywood.",
        locale="en",
    )
    assert enquiry.name == "Test Customer"
    assert enquiry.phone == "0300-1234567"
    assert enquiry.locale == "en"


def test_invalid_enquiry_short_message():
    with pytest.raises(ValidationError):
        EnquiryCreate(
            name="Test",
            phone="123",
            message="hi",  # min_length is 5
        )


def test_category_schema():
    cat = CategoryBase(
        slug="kitchen-sinks",
        name_en="Kitchen Sinks",
        name_ur="باورچی خانے کے سنک",
        sort_order=1,
    )
    assert cat.slug == "kitchen-sinks"
    assert cat.is_published is True


def test_product_schema_hybrid_pricing():
    prod = ProductBase(
        slug="19905-sink-mixer",
        name_en="19905 Sink Mixer",
        name_ur="19905 سنک مکسر",
        price=None,
        price_on_request=True,
    )
    assert prod.price is None
    assert prod.price_on_request is True


def test_production_config_rejects_dev_secret():
    from app.core.config import Settings
    with pytest.raises(ValidationError, match="Insecure SECRET_KEY"):
        Settings(
            APP_ENV="production",
            DEBUG=False,
            SECRET_KEY="dev_secret_hardware_store_key_change_in_production_min32chars!",
        )


def test_production_config_rejects_short_secret():
    from app.core.config import Settings
    with pytest.raises(ValidationError, match="at least 32 characters"):
        Settings(
            APP_ENV="production",
            DEBUG=False,
            SECRET_KEY="short-secret-key",
        )


def test_production_config_rejects_debug_true():
    from app.core.config import Settings
    with pytest.raises(ValidationError, match="DEBUG must be set to False"):
        Settings(
            APP_ENV="production",
            DEBUG=True,
            SECRET_KEY="a" * 48,
        )


def test_production_config_valid():
    from app.core.config import Settings
    cfg = Settings(
        APP_ENV="production",
        DEBUG=False,
        SECRET_KEY="a" * 48,
    )
    assert cfg.APP_ENV == "production"
    assert cfg.DEBUG is False

