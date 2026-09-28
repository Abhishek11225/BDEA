"""Database seeding script."""

import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from src.core.config import settings
from src.models.core import User, Exam, Script, ScriptState, Base
import uuid

async def seed_db():
    engine = create_async_engine(settings.get_database_uri, echo=True)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Create Examiner
        examiner = User(username="dr_sharma", role="EXAMINER")
        moderator = User(username="moderator_lead", role="MODERATOR")
        session.add_all([examiner, moderator])
        
        # Create Exam
        exam = Exam(name="PHYS-2026-04", subject="Physics")
        session.add(exam)
        
        await session.flush()
        
        # Create some Scripts
        scripts = [
            Script(exam_id=exam.id, barcode="4892-A8X9", state=ScriptState.IN_MARKING),
            Script(exam_id=exam.id, barcode="3312-C7Y2", state=ScriptState.MODERATION),
            Script(exam_id=exam.id, barcode="9012-D4W3", state=ScriptState.QC_RUNNING),
            Script(exam_id=exam.id, barcode="84928310", state=ScriptState.HELD_RESCAN),
            Script(exam_id=exam.id, barcode="84928313", state=ScriptState.READY),
        ]
        session.add_all(scripts)
        
        await session.commit()
        print("Database seeded successfully.")

if __name__ == "__main__":
    asyncio.run(seed_db())
