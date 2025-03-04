import bcrypt from "bcrypt";

interface myCrypt {
  password: string | null;
  pass?: string | null;
}

export const crypt = async (data: myCrypt) => {
  const salt = await bcrypt.genSalt(10);
  if (!data.password) {
    throw new Error("Paasword cant be null");
  }
  const hash = bcrypt.hash(data.password, salt);

  return hash;
};

export const compCrypt = async (data: myCrypt) => {
  if (!data.password || !data.pass) {
    throw new Error("password or pass cant be null");
  }
  const value: boolean = await bcrypt.compare(data.password, data.pass);
  return value;
};
