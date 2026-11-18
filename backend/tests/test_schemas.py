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
