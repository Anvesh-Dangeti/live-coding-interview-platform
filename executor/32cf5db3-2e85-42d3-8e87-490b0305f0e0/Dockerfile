FROM gcc:latest
WORKDIR /app
COPY code.cpp .
RUN g++ code.cpp -o out
CMD ["./out"]
