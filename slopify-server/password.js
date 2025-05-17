import bcrypt from "bcrypt";

const comparePassword = ({ user, password }) => {
    if (!user?.password) {
        return false;
    }
    return bcrypt.compare(password, user.password);
};

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

export { comparePassword, hashPassword };