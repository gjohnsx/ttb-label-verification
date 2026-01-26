CREATE TABLE [dbo].[applications] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [DF_applications_id] DEFAULT NEWSEQUENTIALID(),
    [cola_id] NVARCHAR(20) NULL,
    [brand_name] NVARCHAR(255) NOT NULL,
    [class_type] NVARCHAR(255) NULL,
    [alcohol_content] NVARCHAR(50) NULL,
    [net_contents] NVARCHAR(50) NULL,
    [government_warning] NVARCHAR(MAX) NULL,
    [bottler_name] NVARCHAR(255) NULL,
    [bottler_address] NVARCHAR(MAX) NULL,
    [country_of_origin] NVARCHAR(100) NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [DF_applications_created_at] DEFAULT SYSUTCDATETIME(),
    [status] NVARCHAR(20) NOT NULL,
    CONSTRAINT [PK_applications] PRIMARY KEY ([id]),
    CONSTRAINT [CK_applications_status] CHECK (
        [status] IN ('PENDING', 'PROCESSING', 'READY', 'NEEDS_ATTENTION', 'REVIEWED', 'ERROR')
    )
);

CREATE TABLE [dbo].[label_images] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [DF_label_images_id] DEFAULT NEWSEQUENTIALID(),
    [application_id] UNIQUEIDENTIFIER NOT NULL,
    [blob_url] NVARCHAR(500) NOT NULL,
    [image_type] NVARCHAR(20) NOT NULL,
    [uploaded_at] DATETIME2 NOT NULL CONSTRAINT [DF_label_images_uploaded_at] DEFAULT SYSUTCDATETIME(),
    CONSTRAINT [PK_label_images] PRIMARY KEY ([id]),
    CONSTRAINT [FK_label_images_applications]
        FOREIGN KEY ([application_id]) REFERENCES [dbo].[applications]([id])
);

CREATE TABLE [dbo].[ocr_results] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [DF_ocr_results_id] DEFAULT NEWSEQUENTIALID(),
    [image_id] UNIQUEIDENTIFIER NOT NULL,
    [raw_markdown] NVARCHAR(MAX) NULL,
    [extracted_fields] NVARCHAR(MAX) NULL,
    [confidence_scores] NVARCHAR(MAX) NULL,
    [model_version] NVARCHAR(50) NULL,
    [processed_at] DATETIME2 NULL,
    [processing_time_ms] INT NULL,
    CONSTRAINT [PK_ocr_results] PRIMARY KEY ([id]),
    CONSTRAINT [FK_ocr_results_label_images]
        FOREIGN KEY ([image_id]) REFERENCES [dbo].[label_images]([id]),
    CONSTRAINT [CK_ocr_results_extracted_fields] CHECK (
        [extracted_fields] IS NULL OR ISJSON([extracted_fields]) = 1
    ),
    CONSTRAINT [CK_ocr_results_confidence_scores] CHECK (
        [confidence_scores] IS NULL OR ISJSON([confidence_scores]) = 1
    )
);

CREATE TABLE [dbo].[comparisons] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [DF_comparisons_id] DEFAULT NEWSEQUENTIALID(),
    [application_id] UNIQUEIDENTIFIER NOT NULL,
    [merged_fields] NVARCHAR(MAX) NULL,
    [field_sources] NVARCHAR(MAX) NULL,
    [match_results] NVARCHAR(MAX) NULL,
    [overall_status] NVARCHAR(20) NULL,
    [mismatch_count] INT NULL,
    [computed_at] DATETIME2 NULL,
    CONSTRAINT [PK_comparisons] PRIMARY KEY ([id]),
    CONSTRAINT [FK_comparisons_applications]
        FOREIGN KEY ([application_id]) REFERENCES [dbo].[applications]([id]),
    CONSTRAINT [CK_comparisons_overall_status] CHECK (
        [overall_status] IS NULL OR [overall_status] IN ('MATCH', 'NEEDS_REVIEW', 'MISMATCH')
    ),
    CONSTRAINT [CK_comparisons_merged_fields] CHECK (
        [merged_fields] IS NULL OR ISJSON([merged_fields]) = 1
    ),
    CONSTRAINT [CK_comparisons_field_sources] CHECK (
        [field_sources] IS NULL OR ISJSON([field_sources]) = 1
    ),
    CONSTRAINT [CK_comparisons_match_results] CHECK (
        [match_results] IS NULL OR ISJSON([match_results]) = 1
    )
);

CREATE TABLE [dbo].[reviews] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [DF_reviews_id] DEFAULT NEWSEQUENTIALID(),
    [application_id] UNIQUEIDENTIFIER NOT NULL,
    [agent_name] NVARCHAR(100) NOT NULL,
    [verdict] NVARCHAR(20) NOT NULL,
    [reason_code] NVARCHAR(50) NULL,
    [notes] NVARCHAR(MAX) NULL,
    [original_ai_verdict] NVARCHAR(20) NULL,
    [reviewed_at] DATETIME2 NOT NULL CONSTRAINT [DF_reviews_reviewed_at] DEFAULT SYSUTCDATETIME(),
    CONSTRAINT [PK_reviews] PRIMARY KEY ([id]),
    CONSTRAINT [FK_reviews_applications]
        FOREIGN KEY ([application_id]) REFERENCES [dbo].[applications]([id]),
    CONSTRAINT [CK_reviews_verdict] CHECK (
        [verdict] IN ('APPROVED', 'REJECTED', 'OVERRIDE')
    )
);

CREATE TABLE [dbo].[audit_events] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [DF_audit_events_id] DEFAULT NEWSEQUENTIALID(),
    [application_id] UNIQUEIDENTIFIER NOT NULL,
    [agent_name] NVARCHAR(100) NOT NULL,
    [event_type] NVARCHAR(50) NOT NULL,
    [event_data] NVARCHAR(MAX) NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [DF_audit_events_created_at] DEFAULT SYSUTCDATETIME(),
    CONSTRAINT [PK_audit_events] PRIMARY KEY ([id]),
    CONSTRAINT [FK_audit_events_applications]
        FOREIGN KEY ([application_id]) REFERENCES [dbo].[applications]([id]),
    CONSTRAINT [CK_audit_events_event_data] CHECK (
        [event_data] IS NULL OR ISJSON([event_data]) = 1
    )
);
