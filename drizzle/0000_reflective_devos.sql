CREATE TABLE "exercises" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "exercises_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255),
	"name" varchar(255) NOT NULL,
	"category" varchar(100),
	"muscle_group" varchar(100),
	"equipment" varchar(100),
	"description" text,
	"is_custom" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sets" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sets_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"workout_exercise_id" integer NOT NULL,
	"set_number" integer NOT NULL,
	"reps" integer,
	"weight" numeric(10, 2),
	"duration" integer,
	"distance" numeric(10, 2),
	"rpe" integer,
	"is_warmup" boolean DEFAULT false NOT NULL,
	"is_drop_set" boolean DEFAULT false NOT NULL,
	"is_failure" boolean DEFAULT false NOT NULL,
	"completed" boolean DEFAULT true NOT NULL,
	"notes" text,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_exercises" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "workout_exercises_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"workout_id" integer NOT NULL,
	"exercise_id" integer NOT NULL,
	"order_index" integer NOT NULL,
	"target_sets" integer,
	"target_reps" integer,
	"target_weight" numeric(10, 2),
	"rest_time" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workouts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "workouts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"workout_date" timestamp NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"status" varchar(50) DEFAULT 'completed' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sets" ADD CONSTRAINT "sets_workout_exercise_id_workout_exercises_id_fk" FOREIGN KEY ("workout_exercise_id") REFERENCES "public"."workout_exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "exercises_user_id_idx" ON "exercises" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "exercises_category_idx" ON "exercises" USING btree ("category");--> statement-breakpoint
CREATE INDEX "sets_workout_exercise_id_idx" ON "sets" USING btree ("workout_exercise_id");--> statement-breakpoint
CREATE INDEX "workout_exercises_workout_id_idx" ON "workout_exercises" USING btree ("workout_id");--> statement-breakpoint
CREATE INDEX "workout_exercises_exercise_id_idx" ON "workout_exercises" USING btree ("exercise_id");--> statement-breakpoint
CREATE INDEX "workouts_user_id_idx" ON "workouts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "workouts_workout_date_idx" ON "workouts" USING btree ("workout_date");--> statement-breakpoint
CREATE INDEX "workouts_user_id_workout_date_idx" ON "workouts" USING btree ("user_id","workout_date");