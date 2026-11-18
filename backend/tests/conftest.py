import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Set test environment
os.environ["APP_ENV"] = "testing"
os.environ["DEBUG"] = "False"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from app.core.config import settings
from app.db.base import Base
import app.models  # noqa: F401 - Ensure all models are registered with Base.metadata
from app.db.seed import seed_database
from app.db.session import get_db
from app.main import app

# Create in-memory SQLite engine for unit tests
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    # SQLite compatibility for testing (UUID & Enum are stored as string in SQLite)
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db_session():
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def seeded_db(db_session):
    seed_database(db_session)
    return db_session


@pytest.fixture
def client_with_seed(seeded_db):
    def override_get_db():
        try:
            yield seeded_db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def super_admin_user(db_session):
    from app.core.security import get_password_hash
    from app.models.user import AdminRole, AdminUser

    user = AdminUser(
        email="test_super@example.com",
        full_name="Test Super Admin",
        hashed_password=get_password_hash("SuperSecret2026!"),
        role=AdminRole.SUPER_ADMIN,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def super_admin_client(db_session, super_admin_user):
    from app.core.security import create_access_token

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    token = create_access_token(subject=str(super_admin_user.id))
    with TestClient(app, headers={"Authorization": f"Bearer {token}"}) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def editor_user(db_session):
    from app.core.security import get_password_hash
    from app.models.user import AdminRole, AdminUser

    user = AdminUser(
        email="test_editor@example.com",
        full_name="Test Editor",
        hashed_password=get_password_hash("EditorPass2026!"),
        role=AdminRole.CATALOGUE_EDITOR,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def editor_client(db_session, editor_user):
    from app.core.security import create_access_token

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    token = create_access_token(subject=str(editor_user.id))
    with TestClient(app, headers={"Authorization": f"Bearer {token}"}) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def standard_admin_user(db_session):
    from app.core.security import get_password_hash
    from app.models.user import AdminRole, AdminUser

    user = AdminUser(
        email="test_admin@example.com",
        full_name="Test Standard Admin",
        hashed_password=get_password_hash("AdminPass2026!"),
        role=AdminRole.ADMIN,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def standard_admin_client(db_session, standard_admin_user):
    from app.core.security import create_access_token

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    token = create_access_token(subject=str(standard_admin_user.id))
    with TestClient(app, headers={"Authorization": f"Bearer {token}"}) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def enquiry_handler_user(db_session):
    from app.core.security import get_password_hash
    from app.models.user import AdminRole, AdminUser

    user = AdminUser(
        email="test_enquiry@example.com",
        full_name="Test Enquiry Handler",
        hashed_password=get_password_hash("EnquiryPass2026!"),
        role=AdminRole.ENQUIRY_HANDLER,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def enquiry_handler_client(db_session, enquiry_handler_user):
    from app.core.security import create_access_token

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    token = create_access_token(subject=str(enquiry_handler_user.id))
    with TestClient(app, headers={"Authorization": f"Bearer {token}"}) as test_client:
        yield test_client
    app.dependency_overrides.clear()


