import * as path from "path";

const config: any = {
  type: "postgres",
  host: "37.139.42.225",
  port: 5432,
  username: "1dar",
  password: "587p2v#0YjA4Ek0Y",
  database: "1dar",
  entities: [path.resolve(__dirname, "**/*.entity{.ts,.js}")],
  factories: ["dist/database/factories/**/*.js"],
  seeds: ["dist/database/seeds/**/*.js"],
  migrations: ["dist/migration/*.js"],
  migrationsRun: true,
  synchronize: true,
  logging: false

};

export = config;
