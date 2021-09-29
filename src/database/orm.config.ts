import * as path from "path";

const config: any = {
  type: "postgres",
  host: "ec2-18-214-214-252.compute-1.amazonaws.com",
  port: 5432,
  username: "etvdypsagbbsee",
  password: "7ff1ea57a17d1137bdcd2520c474eba13b5d5180b33a217faa1acd72fc511326",
  database: "d2mt4a1mgc8afn",
  entities: [path.resolve(__dirname, "**/*.entity{.ts,.js}")],
  factories: ["dist/database/factories/**/*.js"],
  seeds: ["dist/database/seeds/**/*.js"],
  migrations: ["dist/migration/*.js"],
  migrationsRun: true,
  synchronize: true,
  logging: false,
  ssl: true,
  extra: {
    ssl: {
      rejectUnauthorized: false
    }
  },
  cli: {
    migrationsDir: "src/database/migrations"
  }

};

export = config;
